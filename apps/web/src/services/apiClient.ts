import type {
  AnalysisJobStatusResponse,
  AnalysisReport,
  CreateAnalysisRequest,
  ExperienceLevel,
  HRVerdict,
} from '@screenme/shared';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  const payload = (await res.json().catch(() => null)) as
    | { success: true; data: T }
    | { success: false; error: { code: string; message: string } }
    | null;

  if (!res.ok || !payload || !payload.success) {
    const errMsg =
      payload && !payload.success
        ? payload.error.message
        : `Request failed with status ${res.status}`;
    const errCode =
      payload && !payload.success ? payload.error.code : 'HTTP_ERROR';
    throw new ApiClientError(errMsg, errCode, res.status);
  }

  return payload.data;
}

export interface UploadedResumeSummary {
  resumeId: string;
  fileName: string;
  fileType: 'pdf' | 'docx';
  fileSizeBytes: number;
  pageCount: number;
  wordCount: number;
  detectedSections: string[];
  detectedSkills: string[];
  extractionWarnings: string[];
  textPreview: string;
}

export interface ReportListItem {
  id: string;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  jobMatchScore: number | null;
  atsScore: number;
  hrVerdict: HRVerdict;
  experienceLevel: ExperienceLevel;
  analysisVersion: string;
  scoringVersion: string;
  jdHash: string;
  createdAt: string;
}

export interface ReportListResponse {
  reports: ReportListItem[];
  pagination: { total: number; page: number; limit: number };
  summary: {
    totalAnalyses: number;
    mostRecentJobMatch: number | null;
    comparableImprovementDelta: number | null;
  };
}

export const api = {
  getMe: () =>
    requestJson<{ user: { id: string; name: string; email: string } }>('/auth/me'),

  register: (body: { name: string; email: string; password: string }) =>
    requestJson<{ user: { id: string; name: string; email: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  login: (body: { email: string; password: string }) =>
    requestJson<{ user: { id: string; name: string; email: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  logout: () =>
    requestJson<{ loggedOut: boolean }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    requestJson<{ message: string; devResetToken?: string }>(
      '/auth/forgot-password',
      { method: 'POST', body: JSON.stringify({ email }) }
    ),

  resetPassword: (body: { token: string; newPassword: string }) =>
    requestJson<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadResume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return requestJson<UploadedResumeSummary>('/resumes/upload', {
      method: 'POST',
      body: formData,
    });
  },

  parseJD: (body: {
    title?: string;
    company?: string;
    rawText?: string;
    url?: string;
  }) =>
    requestJson<{
      imported: boolean;
      fallbackReason?: string;
      parsed?: {
        title: string;
        company: string;
        technicalSkills: string[];
        requirementCount: number;
        rawText: string;
      };
    }>('/job-descriptions/parse', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  createAnalysis: (body: CreateAnalysisRequest) =>
    requestJson<{
      analysisId: string;
      status: string;
      deduplicated: boolean;
    }>('/analyses', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  getAnalysisStatus: (analysisId: string) =>
    requestJson<AnalysisJobStatusResponse>(`/analyses/${analysisId}/status`),

  getSampleReport: () =>
    requestJson<{ report: AnalysisReport }>('/reports/sample'),

  getReport: (reportId: string) =>
    requestJson<{ report: AnalysisReport }>(`/reports/${reportId}`),

  listReports: (params: {
    search?: string;
    role?: string;
    sort?: 'newest' | 'oldest' | 'match_desc';
    page?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.search) qs.set('search', params.search);
    if (params.role) qs.set('role', params.role);
    if (params.sort) qs.set('sort', params.sort);
    if (params.page) qs.set('page', String(params.page));
    return requestJson<ReportListResponse>(`/reports?${qs.toString()}`);
  },

  deleteReport: (reportId: string) =>
    requestJson<{ deleted: boolean; id: string }>(`/reports/${reportId}`, {
      method: 'DELETE',
    }),

  updateRoadmapTask: (
    reportId: string,
    body: { taskId: string; completed: boolean }
  ) =>
    requestJson<{ reportId: string; taskId: string; completed: boolean }>(
      `/roadmaps/${reportId}/progress`,
      { method: 'PATCH', body: JSON.stringify(body) }
    ),

  getExportPdfUrl: (reportId: string) =>
    `${API_BASE}/reports/${reportId}/export`,
};

