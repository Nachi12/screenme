import PDFDocument from 'pdfkit';
import type { AnalysisReport } from '@screenme/shared';

export async function generateReportPdfBuffer(report: AnalysisReport): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 48,
      size: 'A4',
      info: {
        Title: `ScreenMe Report — ${report.jobTitle}`,
        Author: 'ScreenMe Analysis Engine',
      },
    });

    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const addSectionTitle = (title: string): void => {
      if (doc.y > 700) doc.addPage();
      doc.moveDown(0.8);
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#0F172A')
        .text(title);
      doc
        .moveTo(48, doc.y + 2)
        .lineTo(547, doc.y + 2)
        .strokeColor('#CBD5E1')
        .lineWidth(0.75)
        .stroke();
      doc.moveDown(0.5);
    };

    const addBody = (text: string, indent = 0): void => {
      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#1E293B')
        .text(text, 48 + indent, undefined, { width: 499 - indent, lineGap: 2 });
    };

    // Header
    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor('#0F172A')
      .text('ScreenMe Resume Intelligence Report');
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#475569')
      .text(
        `${report.isSample ? '[Demonstration Report] ' : ''}Candidate: ${report.candidateName}  |  Target Role: ${report.jobTitle} (${report.companyName})`
      );
    doc.text(
      `Generated: ${new Date(report.createdAt).toLocaleString('en-IN')}  |  Analysis: ${report.analysisVersion}  |  Scoring: ${report.scoringVersion}`
    );

    // Executive Summary
    addSectionTitle('1. Executive Summary');
    addBody(
      `Job Match Score: ${report.jobMatch.score !== null ? `${report.jobMatch.score}/100` : 'Insufficient Evidence'} (Confidence: ${report.jobMatch.confidence})`
    );
    addBody(`ATS Compatibility Score: ${report.atsEvaluation.score}/100`);
    addBody(`HR Screening Verdict: ${report.hrEvaluation.verdict}`);
    doc.moveDown(0.3);
    addBody(report.jobMatch.summary);

    // ATS Findings
    addSectionTitle('2. ATS Compatibility Findings');
    addBody(`Note: ${report.atsEvaluation.disclaimer}`);
    doc.moveDown(0.3);
    for (const chk of report.atsEvaluation.checks) {
      addBody(
        `• [${chk.status.toUpperCase()}] ${chk.name} (${chk.score}/${chk.maxScore}): ${chk.explanation}`,
        8
      );
    }

    // HR Screening Evaluation
    addSectionTitle('3. HR Screening Evaluation');
    addBody(report.hrEvaluation.screeningImpression);
    doc.moveDown(0.3);
    doc.font('Helvetica-Bold').fontSize(10).text('Strengths:');
    for (const s of report.hrEvaluation.strengths) addBody(`• ${s}`, 8);
    doc.moveDown(0.2);
    doc.font('Helvetica-Bold').fontSize(10).text('Concerns:');
    for (const c of report.hrEvaluation.concerns) addBody(`• ${c}`, 8);
    doc.moveDown(0.2);
    addBody(`Readiness Guidance: ${report.hrEvaluation.readinessGuidance}`);

    // Skill Gaps
    addSectionTitle('4. Skill Gaps & Evidence Summary');
    addBody(`Demonstrated Skills: ${report.skillAnalysis.demonstrated.join(', ') || 'None'}`);
    addBody(`Partially Demonstrated: ${report.skillAnalysis.partial.join(', ') || 'None'}`);
    addBody(`Mentioned Without Evidence: ${report.skillAnalysis.mentionedOnly.join(', ') || 'None'}`);
    doc.moveDown(0.3);
    for (const gap of report.skillAnalysis.missing) {
      addBody(
        `• ${gap.skill} [${gap.group.replace('_', ' ')} — ${gap.priority}]: ${gap.suggestedNextAction}`,
        8
      );
    }

    // Project Review
    if (report.projectAnalysis.length > 0) {
      addSectionTitle('5. Project Evaluation');
      for (const proj of report.projectAnalysis) {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .fillColor('#0F172A')
          .text(`${proj.projectName} (JD Relevance: ${proj.relevanceToJD})`);
        addBody(`Assessment: ${proj.complexityAssessment}`, 8);
        if (proj.gaps.length > 0) {
          addBody(`Gaps: ${proj.gaps.join('; ')}`, 8);
        }
        doc.moveDown(0.3);
      }
    }

    // Resume Rewrites
    if (report.rewriteSuggestions.length > 0) {
      addSectionTitle('6. Before & After Resume Rewrites');
      for (const rw of report.rewriteSuggestions) {
        doc.font('Helvetica-Bold').fontSize(10).text(rw.section);
        addBody(`Original: "${rw.originalText}"`, 8);
        addBody(`Suggested: "${rw.suggestedRewrite}"`, 8);
        if (rw.claimsRequiringVerification.length > 0) {
          addBody(
            `Verify before using: ${rw.claimsRequiringVerification.join(' | ')}`,
            8
          );
        }
        doc.moveDown(0.3);
      }
    }

    // Improvement Roadmap
    addSectionTitle(`7. ${report.roadmap.durationWeeks}-Week Improvement Roadmap`);
    addBody(`Disclaimer: ${report.roadmap.disclaimer}`);
    doc.moveDown(0.3);
    for (const task of report.roadmap.tasks) {
      addBody(
        `• Week ${task.week} [${task.priority.toUpperCase()}] ${task.title} (${task.estimatedEffort}): ${task.description}`,
        8
      );
    }

    // Interview Prep
    if (report.interviewQuestions.length > 0) {
      addSectionTitle('8. Role-Specific Interview Questions');
      for (const q of report.interviewQuestions) {
        doc
          .font('Helvetica-Bold')
          .fontSize(10)
          .text(`[${q.difficulty.toUpperCase()} • ${q.skillTested}] ${q.question}`);
        addBody(`Framework: ${q.suggestedAnswerFramework}`, 8);
        doc.moveDown(0.25);
      }
    }

    // Methodology & Limitations
    addSectionTitle('9. Methodology & Limitations');
    addBody(report.jobMatch.disclaimer);
    addBody(report.atsEvaluation.disclaimer);
    addBody(
      'ScreenMe does not invent missing metrics or predict employer-specific applicant tracking or hiring committee outcomes.'
    );

    doc.end();
  });
}

