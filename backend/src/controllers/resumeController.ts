import { Request, Response, NextFunction } from 'express';
import { ResumeService } from '../services/resumeService';
import { ResumeRepository } from '../repositories/resumeRepository';
import { ApiError } from '../utils/ApiError';

export class ResumeController {
  
  // GET /api/resume/faculty/:faculty_id
  static async getFacultyResume(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = Number(req.params.faculty_id);
      const resume = await ResumeService.syncOrCreateResume(facultyId);
      return res.status(200).json(resume);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/resume/faculty/:faculty_id/regenerate
  static async forceRegenerateFacultyResume(req: Request, res: Response, next: NextFunction) {
    try {
      const facultyId = Number(req.params.faculty_id);
      const result = await ResumeService.forceRegenerateResume(facultyId, false);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/resume/verify-email
  static async verifyFacultyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.query.email ? String(req.query.email) : '';
      const result = await ResumeService.verifyFacultyEmail(email);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/resumes
  static async adminListResumes(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const email = req.query.email ? String(req.query.email) : undefined;
      const deptId = req.query.dept_id ? Number(req.query.dept_id) : undefined;

      const resumes = await ResumeService.adminListResumes({ search, email, deptId });
      return res.status(200).json(resumes);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/resumes/:resume_id
  static async adminDeleteResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.resume_id);
      await ResumeService.adminDeleteResume(resumeId);
      return res.status(200).json({ message: 'Resume record and PDF file deleted successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/resumes/:resume_id/regenerate
  static async adminRegenerateResume(req: Request, res: Response, next: NextFunction) {
    try {
      const resumeId = Number(req.params.resume_id);
      const resume = await ResumeRepository.findById(resumeId);
      if (!resume) {
        throw new ApiError(404, 'Resume record not found.');
      }

      await ResumeService.forceRegenerateResume(resume.faculty_id, true);
      return res.status(200).json({ message: 'Resume and PDF file regenerated successfully.' });
    } catch (error) {
      next(error);
    }
  }
}
export default ResumeController;
