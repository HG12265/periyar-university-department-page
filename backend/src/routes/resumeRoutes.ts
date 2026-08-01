import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ResumeController } from '../controllers/resumeController';
import { getCurrentUser, requireRole } from '../middleware/auth';
import { verifyCsrf } from '../middleware/csrf';
import { ApiError } from '../utils/ApiError';
import { auditAction } from '../middleware/audit';

const router = Router();

// Strict rate limiting for user-triggered resume PDF regeneration (2 per minute)
const resumeRegenLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Rate limit exceeded for resume regeneration. Please wait a minute before retrying.'));
  },
});

// Public resume endpoints
router.get('/resume/faculty/:faculty_id', ResumeController.getFacultyResume);
router.post('/resume/faculty/:faculty_id/regenerate', resumeRegenLimiter, ResumeController.forceRegenerateFacultyResume);
router.get('/resume/verify-email', ResumeController.verifyFacultyEmail);

// Admin resume management
router.get('/admin/resumes', getCurrentUser, requireRole('dept_admin'), ResumeController.adminListResumes);
router.delete('/admin/resumes/:resume_id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_RESUME_RECORD', 'RESUME_MASTER_TABLE'), ResumeController.adminDeleteResume);
router.post('/admin/resumes/:resume_id/regenerate', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('REGENERATE_RESUME_RECORD', 'RESUME_MASTER_TABLE'), ResumeController.adminRegenerateResume);

export default router;
