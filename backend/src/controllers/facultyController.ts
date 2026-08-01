import { Request, Response, NextFunction } from 'express';
import { FacultyService } from '../services/facultyService';

export class FacultyController {
  
  // POST /api/admin/faculties
  static async addFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        dept_id,
        name,
        designation,
        email,
        specialization,
        image_url,
        profile_url,
        is_former,
        order_index,
      } = req.body;

      const faculty = await FacultyService.addFaculty(
        dept_id,
        name,
        designation,
        email,
        specialization,
        image_url,
        profile_url,
        is_former,
        order_index
      );

      return res.status(200).json(faculty);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/faculties/:id
  static async updateFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const fields = req.body;

      const faculty = await FacultyService.updateFaculty(id, fields);
      return res.status(200).json(faculty);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/remove-faculty/:id
  static async deleteFaculty(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await FacultyService.deleteFaculty(id);
      return res.status(200).json({ message: 'Faculty removed' });
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/faculties-all
  static async getAllFaculties(req: Request, res: Response, next: NextFunction) {
    try {
      const faculties = await FacultyService.getAllFacultiesWithEmpId();
      return res.status(200).json(faculties);
    } catch (error) {
      next(error);
    }
  }
}
export default FacultyController;
