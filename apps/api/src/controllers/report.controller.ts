import type { NextFunction, Request, Response } from 'express';
import {
  ReportListQuerySchema,
  SAMPLE_DEMONSTRATION_REPORT,
  UpdateRoadmapProgressSchema,
  type AnalysisReport,
} from '@screenme/shared';
import { AnalysisReportModel } from '../models/AnalysisReport.model.js';
import { JobDescriptionModel } from '../models/JobDescription.model.js';
import { ResumeModel } from '../models/Resume.model.js';
import { RoadmapProgressModel } from '../models/RoadmapProgress.model.js';
import { generateReportPdfBuffer } from '../services/reporting/pdfExport.service.js';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

function assertReportOwnership(
  doc: { userId?: unknown; guestSessionId?: string | null },
  req: Request
): void {
  if (doc.userId) {
    if (!req.user || String(doc.userId) !== req.user.userId) {
      throw new ForbiddenError('You do not have permission to access this report.');
    }
    return;
  }
  if (doc.guestSessionId) {
    if (!req.guestSessionId || doc.guestSessionId !== req.guestSessionId) {
      throw new ForbiddenError('You do not have permission to access this guest report.');
    }
    return;
  }
  throw new ForbiddenError('Access denied.');
}

async function mergeRoadmapProgress(
  reportId: string,
  report: AnalysisReport
): Promise<AnalysisReport> {
  const progress = await RoadmapProgressModel.findOne({ reportId });
  if (!progress) return report;
  const completedMap = progress.completedTasks as unknown as Map<string, boolean>;
  return {
    ...report,
    roadmap: {
      ...report.roadmap,
      tasks: report.roadmap.tasks.map((task) => ({
        ...task,
        completed:
          typeof completedMap.get === 'function'
            ? Boolean(completedMap.get(task.taskId))
            : Boolean((progress.completedTasks as Record<string, boolean>)[task.taskId]),
      })),
    },
  };
}

export function getSampleReport(_req: Request, res: Response): void {
  sendSuccess(res, { report: SAMPLE_DEMONSTRATION_REPORT });
}

export async function listReports(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required.');
    }

    const query = ReportListQuerySchema.parse(req.query);
    const docs = await AnalysisReportModel.find({
      userId: req.user.userId,
      status: 'completed',
      report: { $ne: null },
    })
      .select(
        'analysisVersion scoringVersion jdHash createdAt report.jobTitle report.companyName report.candidateName report.jobMatch.score report.atsEvaluation.score report.hrEvaluation.verdict report.candidateProfile.experienceLevel'
      )
      .sort({ createdAt: query.sort === 'oldest' ? 1 : -1 })
      .lean();

    let items = docs
      .filter((d) => d.report)
      .map((d) => {
        const r = d.report as AnalysisReport;
        return {
          id: String(d._id),
          jobTitle: r.jobTitle,
          companyName: r.companyName,
          candidateName: r.candidateName,
          jobMatchScore: r.jobMatch.score,
          atsScore: r.atsEvaluation.score,
          hrVerdict: r.hrEvaluation.verdict,
          experienceLevel: r.candidateProfile.experienceLevel,
          analysisVersion: d.analysisVersion,
          scoringVersion: d.scoringVersion,
          jdHash: d.jdHash,
          createdAt: d.createdAt,
        };
      });

    if (query.search) {
      const needle = query.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.jobTitle.toLowerCase().includes(needle) ||
          i.companyName.toLowerCase().includes(needle) ||
          i.candidateName.toLowerCase().includes(needle)
      );
    }

    if (query.role) {
      const roleNeedle = query.role.toLowerCase();
      items = items.filter((i) => i.jobTitle.toLowerCase().includes(roleNeedle));
    }

    if (query.sort === 'match_desc') {
      items.sort((a, b) => (b.jobMatchScore ?? -1) - (a.jobMatchScore ?? -1));
    }

    const total = items.length;
    const start = (query.page - 1) * query.limit;
    const paginated = items.slice(start, start + query.limit);

    // Compute improvement trend only across comparable analyses (same jdHash AND same scoringVersion)
    const byJd = new Map<string, typeof items>();
    for (const item of items) {
      const key = `${item.jdHash}::${item.scoringVersion}`;
      const list = byJd.get(key) ?? [];
      list.push(item);
      byJd.set(key, list);
    }

    let comparableImprovementDelta: number | null = null;
    for (const group of byJd.values()) {
      if (group.length >= 2) {
        const sorted = [...group].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const first = sorted[0]?.jobMatchScore;
        const latest = sorted[sorted.length - 1]?.jobMatchScore;
        if (typeof first === 'number' && typeof latest === 'number') {
          comparableImprovementDelta = latest - first;
          break;
        }
      }
    }

    const mostRecent = items[0] ?? null;

    sendSuccess(res, {
      reports: paginated,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
      },
      summary: {
        totalAnalyses: total,
        mostRecentJobMatch: mostRecent?.jobMatchScore ?? null,
        comparableImprovementDelta,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getReportById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.params.id === SAMPLE_DEMONSTRATION_REPORT.id) {
      sendSuccess(res, { report: SAMPLE_DEMONSTRATION_REPORT });
      return;
    }

    const doc = await AnalysisReportModel.findById(req.params.id);
    if (!doc || doc.status !== 'completed' || !doc.report) {
      throw new NotFoundError('Report not found.');
    }
    assertReportOwnership(doc, req);

    const report = await mergeRoadmapProgress(
      doc.id,
      doc.report as AnalysisReport
    );
    sendSuccess(res, { report });
  } catch (err) {
    next(err);
  }
}

export async function deleteReportById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const doc = await AnalysisReportModel.findById(req.params.id);
    if (!doc) {
      throw new NotFoundError('Report not found.');
    }
    assertReportOwnership(doc, req);

    const resumeId = doc.resumeId;
    const jdId = doc.jobDescriptionId;

    await Promise.all([
      AnalysisReportModel.deleteOne({ _id: doc._id }),
      RoadmapProgressModel.deleteMany({ reportId: doc._id }),
      JobDescriptionModel.deleteOne({ _id: jdId }),
    ]);

    // Remove resume document if no other reports reference it
    const otherRefs = await AnalysisReportModel.countDocuments({ resumeId });
    if (otherRefs === 0) {
      await ResumeModel.deleteOne({ _id: resumeId });
    }

    sendSuccess(res, { deleted: true, id: doc.id });
  } catch (err) {
    next(err);
  }
}

export async function exportReportPdf(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let report: AnalysisReport;
    if (req.params.id === SAMPLE_DEMONSTRATION_REPORT.id) {
      report = SAMPLE_DEMONSTRATION_REPORT;
    } else {
      const doc = await AnalysisReportModel.findById(req.params.id);
      if (!doc || doc.status !== 'completed' || !doc.report) {
        throw new NotFoundError('Completed report not found for export.');
      }
      assertReportOwnership(doc, req);
      report = await mergeRoadmapProgress(doc.id, doc.report as AnalysisReport);
    }

    const pdfBuffer = await generateReportPdfBuffer(report);
    const safeSlug = report.jobTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="screenme-report-${safeSlug || 'analysis'}.pdf"`
    );
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
}

export async function updateRoadmapProgress(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { taskId, completed } = UpdateRoadmapProgressSchema.parse(req.body);
    const doc = await AnalysisReportModel.findById(req.params.id);
    if (!doc || doc.status !== 'completed' || !doc.report) {
      throw new NotFoundError('Report not found.');
    }
    assertReportOwnership(doc, req);

    const report = doc.report as AnalysisReport;
    const validTask = report.roadmap.tasks.some((t) => t.taskId === taskId);
    if (!validTask) {
      throw new ValidationError('Invalid roadmap task ID.');
    }

    const progress = await RoadmapProgressModel.findOneAndUpdate(
      { reportId: doc._id },
      {
        $set: { [`completedTasks.${taskId}`]: completed },
        $setOnInsert: {
          reportId: doc._id,
          userId: doc.userId ?? null,
          guestSessionId: doc.guestSessionId ?? null,
          expiresAt: doc.expiresAt ?? null,
        },
      },
      { upsert: true, new: true }
    );

    sendSuccess(res, {
      reportId: doc.id,
      taskId,
      completed,
      completedTasks: progress.completedTasks,
    });
  } catch (err) {
    next(err);
  }
}

