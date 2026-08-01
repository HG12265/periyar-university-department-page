"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResumeController = void 0;
const resumeService_1 = require("../services/resumeService");
const resumeRepository_1 = require("../repositories/resumeRepository");
const ApiError_1 = require("../utils/ApiError");
class ResumeController {
    // GET /api/resume/faculty/:faculty_id
    static async getFacultyResume(req, res, next) {
        try {
            const facultyId = Number(req.params.faculty_id);
            const resume = await resumeService_1.ResumeService.syncOrCreateResume(facultyId);
            return res.status(200).json(resume);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/resume/faculty/:faculty_id/regenerate
    static async forceRegenerateFacultyResume(req, res, next) {
        try {
            const facultyId = Number(req.params.faculty_id);
            const result = await resumeService_1.ResumeService.forceRegenerateResume(facultyId, false);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/resume/verify-email
    static async verifyFacultyEmail(req, res, next) {
        try {
            const email = req.query.email ? String(req.query.email) : '';
            const result = await resumeService_1.ResumeService.verifyFacultyEmail(email);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/admin/resumes
    static async adminListResumes(req, res, next) {
        try {
            const search = req.query.search ? String(req.query.search) : undefined;
            const email = req.query.email ? String(req.query.email) : undefined;
            const deptId = req.query.dept_id ? Number(req.query.dept_id) : undefined;
            const resumes = await resumeService_1.ResumeService.adminListResumes({ search, email, deptId });
            return res.status(200).json(resumes);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/admin/resumes/:resume_id
    static async adminDeleteResume(req, res, next) {
        try {
            const resumeId = Number(req.params.resume_id);
            await resumeService_1.ResumeService.adminDeleteResume(resumeId);
            return res.status(200).json({ message: 'Resume record and PDF file deleted successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/resumes/:resume_id/regenerate
    static async adminRegenerateResume(req, res, next) {
        try {
            const resumeId = Number(req.params.resume_id);
            const resume = await resumeRepository_1.ResumeRepository.findById(resumeId);
            if (!resume) {
                throw new ApiError_1.ApiError(404, 'Resume record not found.');
            }
            await resumeService_1.ResumeService.forceRegenerateResume(resume.faculty_id, true);
            return res.status(200).json({ message: 'Resume and PDF file regenerated successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ResumeController = ResumeController;
exports.default = ResumeController;
