import { Request, Response, NextFunction } from 'express';
import { DepartmentService } from '../services/departmentService';
import { MuseumScraper } from '../utils/museumScraper';

export class DeptController {
  
  // GET /api/departments
  static async getDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await DepartmentService.getAllDepartments();
      return res.status(200).json(depts);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/departments/:slug
  static async getDepartmentBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const dept = await DepartmentService.getDepartmentBySlug(slug as string);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/list-departments
  static async adminListDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const depts = await DepartmentService.getAllDepartments();
      return res.status(200).json(depts);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/admin/departments/:id
  static async adminGetDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const dept = await DepartmentService.getDepartmentById(id);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/departments
  static async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, slug, title, banner_image } = req.query; // Python reads these from query params!
      const nameStr = name ? String(name) : '';
      const slugStr = slug ? String(slug) : '';
      const titleStr = title ? String(title) : undefined;
      const bannerStr = banner_image ? String(banner_image) : undefined;

      const dept = await DepartmentService.createDepartment(nameStr, slugStr, titleStr, bannerStr);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/departments/:id
  static async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { name, slug, title, banner_image } = req.query; // Python reads from query params!
      const nameStr = name ? String(name) : undefined;
      const slugStr = slug ? String(slug) : undefined;
      const titleStr = title ? String(title) : undefined;
      const bannerStr = banner_image ? String(banner_image) : undefined;

      const dept = await DepartmentService.updateDepartment(id, nameStr, slugStr, titleStr, bannerStr);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/departments/:id
  static async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentService.deleteDepartment(id);
      return res.status(200).json({ message: 'Department deleted' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // SECTIONS
  // ==========================================

  // POST /api/admin/sections
  static async addSection(req: Request, res: Response, next: NextFunction) {
    try {
      const { dept_id, section_title, category, content, order_index } = req.body;
      const section = await DepartmentService.addSection(dept_id, section_title, category, content, order_index);
      return res.status(200).json(section);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/sections/:id
  static async updateSection(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { section_title, content, category, order_index } = req.body;
      const section = await DepartmentService.updateSection(id, section_title, content, category, order_index);
      return res.status(200).json(section);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/remove-section/:id
  static async deleteSection(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentService.deleteSection(id);
      return res.status(200).json({ message: 'Section removed' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // NAV LINKS
  // ==========================================

  // POST /api/admin/nav-links
  static async addNavLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { dept_id, label, url, order_index } = req.body;
      const link = await DepartmentService.addNavLink(dept_id, label, url, order_index);
      return res.status(200).json(link);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/remove-link/:id
  static async deleteNavLink(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentService.deleteNavLink(id);
      return res.status(200).json({ message: 'Nav link removed' });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ALUMNI
  // ==========================================

  // GET /api/admin/alumni/:dept_id
  static async getAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const data = await DepartmentService.getAlumni(deptId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/alumni/:dept_id
  static async saveAlumni(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const { columns, rows, meeting_title, meeting_images } = req.body;
      const data = await DepartmentService.saveAlumni(deptId, columns, rows, meeting_title, meeting_images);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // PLACEMENT
  // ==========================================

  // GET /api/admin/placement/:dept_id
  static async getPlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const data = await DepartmentService.getPlacement(deptId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/placement/:dept_id
  static async savePlacement(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const { columns, rows, meeting_title, meeting_images } = req.body;
      const data = await DepartmentService.savePlacement(deptId, columns, rows, meeting_title, meeting_images);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // FACILITIES
  // ==========================================

  // POST /api/admin/facilities
  static async addFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const { dept_id, title, image_url, link_url, order_index } = req.body;
      const facility = await DepartmentService.addFacility(dept_id, title, image_url, link_url, order_index);
      return res.status(200).json(facility);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/facilities/:id
  static async updateFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      const { title, image_url, link_url, order_index } = req.body;
      const facility = await DepartmentService.updateFacility(id, title, image_url, link_url, order_index);
      return res.status(200).json(facility);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/remove-facility/:id
  static async deleteFacility(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.params.id);
      await DepartmentService.deleteFacility(id);
      return res.status(200).json({ message: 'Facility removed' });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/departments/:dept_id/facilities-config
  static async saveFacilitiesConfig(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const { facilities_req_title, facilities_req_file, facilities_btn_label, facilities_btn_url } = req.body;
      const dept = await DepartmentService.saveFacilitiesConfig(deptId, facilities_req_title, facilities_req_file, facilities_btn_label, facilities_btn_url);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/departments/:dept_id/facilities-table
  static async saveFacilitiesTable(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const { columns, rows, table_title } = req.body;
      const dept = await DepartmentService.saveFacilitiesTable(deptId, columns, rows, table_title);
      return res.status(200).json(dept);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // ACTIVITY GALLERY
  // ==========================================

  // GET /api/admin/activity-gallery/:dept_id
  static async getActivityGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const data = await DepartmentService.getActivityGallery(deptId);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/activity-gallery/:dept_id
  static async saveActivityGallery(req: Request, res: Response, next: NextFunction) {
    try {
      const deptId = Number(req.params.dept_id);
      const { events } = req.body;
      const data = await DepartmentService.saveActivityGallery(deptId, events);
      return res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/scrape-museum
  static async scrapeMuseum(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await MuseumScraper.scrapeAndSave();
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
export default DeptController;
