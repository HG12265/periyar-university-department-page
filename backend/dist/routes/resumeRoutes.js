"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const resumeController_1 = require("../controllers/resumeController");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const ApiError_1 = require("../utils/ApiError");
const audit_1 = require("../middleware/audit");
const router = (0, express_1.Router)();
// Strict rate limiting for user-triggered resume PDF regeneration (2 per minute)
const resumeRegenLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 2,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError_1.ApiError(429, 'Rate limit exceeded for resume regeneration. Please wait a minute before retrying.'));
    },
});
// Public resume endpoints
router.get('/resume/faculty/:faculty_id', resumeController_1.ResumeController.getFacultyResume);
router.post('/resume/faculty/:faculty_id/regenerate', resumeRegenLimiter, resumeController_1.ResumeController.forceRegenerateFacultyResume);
router.get('/resume/verify-email', resumeController_1.ResumeController.verifyFacultyEmail);
// Admin resume management
router.get('/admin/resumes', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), resumeController_1.ResumeController.adminListResumes);
router.delete('/admin/resumes/:resume_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_RESUME_RECORD', 'RESUME_MASTER_TABLE'), resumeController_1.ResumeController.adminDeleteResume);
router.post('/admin/resumes/:resume_id/regenerate', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('REGENERATE_RESUME_RECORD', 'RESUME_MASTER_TABLE'), resumeController_1.ResumeController.adminRegenerateResume);
exports.default = router;
