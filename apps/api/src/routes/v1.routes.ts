import { Router } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';
import * as analysisController from '../controllers/analysis.controller.js';
import * as authController from '../controllers/auth.controller.js';
import * as reportController from '../controllers/report.controller.js';
import * as resumeController from '../controllers/resume.controller.js';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware.js';
import {
  analysisRateLimiter,
  authRateLimiter,
} from '../middleware/rateLimit.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE_BYTES,
    files: 1,
  },
});

export function createV1Router(): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', service: 'screenme-api' } });
  });

  // Auth routes
  router.post('/auth/register', authRateLimiter, authController.register);
  router.post('/auth/login', authRateLimiter, authController.login);
  router.post('/auth/logout', authController.logout);
  router.get('/auth/me', requireAuth, authController.me);
  router.post(
    '/auth/forgot-password',
    authRateLimiter,
    authController.forgotPassword
  );
  router.post(
    '/auth/reset-password',
    authRateLimiter,
    authController.resetPassword
  );

  // Resume & JD ingestion
  router.post(
    '/resumes/upload',
    optionalAuth,
    upload.single('file'),
    resumeController.uploadResume
  );
  router.post(
    '/job-descriptions/parse',
    optionalAuth,
    resumeController.parseJobDescriptionEndpoint
  );

  // Analysis pipeline
  router.post(
    '/analyses',
    optionalAuth,
    analysisRateLimiter,
    analysisController.createAnalysis
  );
  router.get(
    '/analyses/:id/status',
    optionalAuth,
    analysisController.getAnalysisStatus
  );
  router.get('/analyses/:id', optionalAuth, analysisController.getAnalysisResult);

  // Reports & Roadmaps
  router.get('/reports/sample', reportController.getSampleReport);
  router.get('/reports', requireAuth, reportController.listReports);
  router.get('/reports/:id', optionalAuth, reportController.getReportById);
  router.delete('/reports/:id', optionalAuth, reportController.deleteReportById);
  router.get('/reports/:id/export', optionalAuth, reportController.exportReportPdf);
  router.patch(
    '/roadmaps/:id/progress',
    optionalAuth,
    reportController.updateRoadmapProgress
  );

  return router;
}

