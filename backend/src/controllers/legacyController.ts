import { Request, Response, NextFunction } from 'express';
import { LegacyService } from '../services/legacyService';

export class LegacyController {
  
  // GET /api/admin/dashboard-stats
  static async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await LegacyService.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // FOREIGN VISITS
  // ==========================================

  // GET /api/admin/foreign-visits
  static async listForeignVisits(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
      const exportAll = req.query.export === 'true';

      const result = await LegacyService.listForeignVisits({
        page,
        limit,
        search,
        empId,
        exportAll,
      });

      if (exportAll) {
        const csvContent = LegacyService.generateForeignVisitsCsv(result.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=foreign_visits.csv');
        return res.status(200).send(csvContent);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/foreign-visits
  static async addForeignVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LegacyService.addForeignVisit(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/foreign-visits/:id
  static async updateForeignVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.updateForeignVisit(id, req.body);
      return res.status(200).json({ message: 'Foreign visit record updated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/foreign-visits/:id
  static async deleteForeignVisit(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.deleteForeignVisit(id);
      return res.status(200).json({ message: 'Foreign visit record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ORGANIZERS
  // ==========================================

  // GET /api/admin/organizers
  static async listOrganizers(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
      const exportAll = req.query.export === 'true';

      const result = await LegacyService.listOrganizers({
        page,
        limit,
        search,
        empId,
        exportAll,
      });

      if (exportAll) {
        const csvContent = LegacyService.generateOrganizersCsv(result.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=organizers.csv');
        return res.status(200).send(csvContent);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/organizers
  static async addOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LegacyService.addOrganizer(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/organizers/:id
  static async updateOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.updateOrganizer(id, req.body);
      return res.status(200).json({ message: 'Organizer record updated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/organizers/:id
  static async deleteOrganizer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.deleteOrganizer(id);
      return res.status(200).json({ message: 'Organizer record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PUBLICATIONS
  // ==========================================

  // GET /api/admin/publications
  static async listPublications(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const search = req.query.search ? String(req.query.search) : undefined;
      const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
      const exportAll = req.query.export === 'true';

      const result = await LegacyService.listPublications({
        page,
        limit,
        search,
        empId,
        exportAll,
      });

      if (exportAll) {
        const csvContent = LegacyService.generatePublicationsCsv(result.data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=publications.csv');
        return res.status(200).send(csvContent);
      }

      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/publications
  static async addPublication(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LegacyService.addPublication(req.body);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/publications/:id
  static async updatePublication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.updatePublication(id, req.body);
      return res.status(200).json({ message: 'Publication record updated successfully.' });
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/publications/:id
  static async deletePublication(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await LegacyService.deletePublication(id);
      return res.status(200).json({ message: 'Publication record deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
export default LegacyController;
