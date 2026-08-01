import { DepartmentRepository, Department, Section, NavLink, Facility } from '../repositories/departmentRepository';
import { FacultyRepository, Faculty } from '../repositories/facultyRepository';
import { ApiError } from '../utils/ApiError';

export class DepartmentService {
  // Get list of departments
  static async getAllDepartments(): Promise<Department[]> {
    return await DepartmentRepository.getAll();
  }

  // Get department details by slug (with sections, links, faculties, and tables)
  static async getDepartmentBySlug(slug: string) {
    const dept = await DepartmentRepository.findBySlug(slug);
    if (!dept) {
      throw new ApiError(404, 'Department not found');
    }
    return await this.compileDepartmentFullData(dept);
  }

  // Get department details by ID (for admin operations)
  static async getDepartmentById(id: number) {
    const dept = await DepartmentRepository.findById(id);
    if (!dept) {
      throw new ApiError(404, 'Department not found');
    }
    
    const sections = await DepartmentRepository.getSectionsByDept(dept.id);
    const navLinks = await DepartmentRepository.getNavLinksByDept(dept.id);
    const faculties = await FacultyRepository.getByDept(dept.id);
    const facilities = await DepartmentRepository.getFacilitiesByDept(dept.id);
    
    let facilitiesTableParsed = { columns: [], rows: [], table_title: '' };
    if (dept.facilities_table) {
      try {
        facilitiesTableParsed = JSON.parse(dept.facilities_table);
      } catch (e) {
        // Fallback on corrupt JSON
      }
    }

    return {
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      title: dept.title || '',
      banner_image: dept.banner_image || '',
      sections,
      nav_links: navLinks,
      faculties,
      facilities_req_title: dept.facilities_req_title || '',
      facilities_req_file: dept.facilities_req_file || '',
      facilities_btn_label: dept.facilities_btn_label || '',
      facilities_btn_url: dept.facilities_btn_url || '',
      facilities,
      facilities_table: facilitiesTableParsed
    };
  }

  // Helper to compile full parsed department detail payload
  private static async compileDepartmentFullData(dept: Department) {
    const sections = await DepartmentRepository.getSectionsByDept(dept.id);
    const navLinks = await DepartmentRepository.getNavLinksByDept(dept.id);
    const faculties = await FacultyRepository.getByDept(dept.id);
    const facilities = await DepartmentRepository.getFacilitiesByDept(dept.id);

    // Fetch and parse Alumni Table
    let alumniData = null;
    const alumniRaw = await DepartmentRepository.getAlumniByDept(dept.id);
    if (alumniRaw) {
      try {
        alumniData = {
          columns: JSON.parse(alumniRaw.columns),
          rows: JSON.parse(alumniRaw.rows),
          meeting_title: alumniRaw.meeting_title || '',
          meeting_images: alumniRaw.meeting_images ? JSON.parse(alumniRaw.meeting_images) : []
        };
      } catch (e) {
        alumniData = { columns: [], rows: [], meeting_title: '', meeting_images: [] };
      }
    }

    // Fetch and parse Placement Table
    let placementData = null;
    const placementRaw = await DepartmentRepository.getPlacementByDept(dept.id);
    if (placementRaw) {
      try {
        placementData = {
          columns: JSON.parse(placementRaw.columns),
          rows: JSON.parse(placementRaw.rows),
          meeting_title: placementRaw.meeting_title || '',
          meeting_images: placementRaw.meeting_images ? JSON.parse(placementRaw.meeting_images) : []
        };
      } catch (e) {
        placementData = { columns: [], rows: [], meeting_title: '', meeting_images: [] };
      }
    }

    // Parse Facilities Table
    let facilitiesTableParsed = { columns: [], rows: [], table_title: '' };
    if (dept.facilities_table) {
      try {
        facilitiesTableParsed = JSON.parse(dept.facilities_table);
      } catch (e) {
        // Ignore JSON error
      }
    }

    // Fetch and parse Activity Gallery
    let activityGallery = { events: [] };
    const activityRaw = await DepartmentRepository.getActivityGalleryByDept(dept.id);
    if (activityRaw) {
      try {
        activityGallery = {
          events: JSON.parse(activityRaw)
        };
      } catch (e) {
        activityGallery = { events: [] };
      }
    }

    return {
      id: dept.id,
      name: dept.name,
      slug: dept.slug,
      title: dept.title || '',
      banner_image: dept.banner_image || '',
      sections,
      nav_links: navLinks,
      faculties,
      alumni_table: alumniData,
      placement_table: placementData,
      facilities_req_title: dept.facilities_req_title || '',
      facilities_req_file: dept.facilities_req_file || '',
      facilities_btn_label: dept.facilities_btn_label || '',
      facilities_btn_url: dept.facilities_btn_url || '',
      facilities,
      facilities_table: facilitiesTableParsed,
      activity_gallery: activityGallery
    };
  }

  // Create Department (Super Admin)
  static async createDepartment(name: string, slug: string, title?: string, bannerImage?: string) {
    const existing = await DepartmentRepository.findBySlug(slug);
    if (existing) {
      throw new ApiError(400, `Slug '${slug}' is already taken.`);
    }
    const id = await DepartmentRepository.create(name, slug, title, bannerImage);
    return await this.getDepartmentById(id);
  }

  // Update Department (Super Admin)
  static async updateDepartment(id: number, name?: string, slug?: string, title?: string, bannerImage?: string) {
    if (slug) {
      const existing = await DepartmentRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw new ApiError(400, `Slug '${slug}' is already taken.`);
      }
    }
    await DepartmentRepository.update(id, name, slug, title, bannerImage);
    return await this.getDepartmentById(id);
  }

  // Delete Department (Super Admin)
  static async deleteDepartment(id: number): Promise<void> {
    const existing = await DepartmentRepository.findById(id);
    if (!existing) {
      throw new ApiError(404, 'Department not found');
    }
    await DepartmentRepository.delete(id);
  }

  // ==========================================
  // SECTIONS BUSINESS LOGIC
  // ==========================================

  static async addSection(deptId: number, title: string, category: string, content: string, orderIndex = 0) {
    const dept = await DepartmentRepository.findById(deptId);
    if (!dept) {
      throw new ApiError(404, 'Department not found');
    }
    const id = await DepartmentRepository.addSection(deptId, title, category, content, orderIndex);
    return await DepartmentRepository.findSectionById(id);
  }

  static async updateSection(id: number, title?: string, content?: string, category?: string, orderIndex?: number) {
    const existing = await DepartmentRepository.findSectionById(id);
    if (!existing) {
      throw new ApiError(404, 'Section not found');
    }
    await DepartmentRepository.updateSection(id, title, content, category, orderIndex);
    return await DepartmentRepository.findSectionById(id);
  }

  static async deleteSection(id: number): Promise<void> {
    const existing = await DepartmentRepository.findSectionById(id);
    if (!existing) {
      throw new ApiError(404, 'Section not found');
    }
    await DepartmentRepository.deleteSection(id);
  }

  // ==========================================
  // NAV LINKS BUSINESS LOGIC
  // ==========================================

  static async addNavLink(deptId: number, label: string, url: string, orderIndex = 0) {
    const dept = await DepartmentRepository.findById(deptId);
    if (!dept) {
      throw new ApiError(404, 'Department not found');
    }
    const id = await DepartmentRepository.addNavLink(deptId, label, url, orderIndex);
    return { id, dept_id: deptId, label, url, order_index: orderIndex };
  }

  static async deleteNavLink(id: number): Promise<void> {
    await DepartmentRepository.deleteNavLink(id);
  }

  // ==========================================
  // ALUMNI AND PLACEMENT BUSINESS LOGIC
  // ==========================================

  static async getAlumni(deptId: number) {
    const data = await DepartmentRepository.getAlumniByDept(deptId);
    if (!data) return { columns: [], rows: [], meeting_title: '', meeting_images: [] };
    return {
      columns: JSON.parse(data.columns),
      rows: JSON.parse(data.rows),
      meeting_title: data.meeting_title || '',
      meeting_images: data.meeting_images ? JSON.parse(data.meeting_images) : []
    };
  }

  static async saveAlumni(deptId: number, columns: any[], rows: any[], meetingTitle: string | null, meetingImages: string[] | null) {
    const colsStr = JSON.stringify(columns);
    const rowsStr = JSON.stringify(rows);
    const imgsStr = meetingImages ? JSON.stringify(meetingImages) : null;
    await DepartmentRepository.saveAlumni(deptId, colsStr, rowsStr, meetingTitle, imgsStr);
    return await this.getAlumni(deptId);
  }

  static async getPlacement(deptId: number) {
    const data = await DepartmentRepository.getPlacementByDept(deptId);
    if (!data) return { columns: [], rows: [], meeting_title: '', meeting_images: [] };
    return {
      columns: JSON.parse(data.columns),
      rows: JSON.parse(data.rows),
      meeting_title: data.meeting_title || '',
      meeting_images: data.meeting_images ? JSON.parse(data.meeting_images) : []
    };
  }

  static async savePlacement(deptId: number, columns: any[], rows: any[], meetingTitle: string | null, meetingImages: string[] | null) {
    const colsStr = JSON.stringify(columns);
    const rowsStr = JSON.stringify(rows);
    const imgsStr = meetingImages ? JSON.stringify(meetingImages) : null;
    await DepartmentRepository.savePlacement(deptId, colsStr, rowsStr, meetingTitle, imgsStr);
    return await this.getPlacement(deptId);
  }

  // ==========================================
  // FACILITIES BUSINESS LOGIC
  // ==========================================

  static async addFacility(deptId: number, title: string, imageUrl?: string, linkUrl?: string, orderIndex = 0) {
    const id = await DepartmentRepository.addFacility(deptId, title, imageUrl, linkUrl, orderIndex);
    return await DepartmentRepository.findFacilityById(id);
  }

  static async updateFacility(id: number, title?: string, imageUrl?: string, linkUrl?: string, orderIndex?: number) {
    const existing = await DepartmentRepository.findFacilityById(id);
    if (!existing) {
      throw new ApiError(404, 'Facility not found');
    }
    await DepartmentRepository.updateFacility(id, title, imageUrl, linkUrl, orderIndex);
    return await DepartmentRepository.findFacilityById(id);
  }

  static async deleteFacility(id: number): Promise<void> {
    const existing = await DepartmentRepository.findFacilityById(id);
    if (!existing) {
      throw new ApiError(404, 'Facility not found');
    }
    await DepartmentRepository.deleteFacility(id);
  }

  static async saveFacilitiesConfig(deptId: number, reqTitle: string | null, reqFile: string | null, btnLabel: string | null, btnUrl: string | null) {
    await DepartmentRepository.saveFacilitiesConfig(deptId, reqTitle, reqFile, btnLabel, btnUrl);
    return await this.getDepartmentById(deptId);
  }

  static async saveFacilitiesTable(deptId: number, columns: any[], rows: any[], tableTitle: string) {
    const gridObj = { columns, rows, table_title: tableTitle };
    await DepartmentRepository.saveFacilitiesTable(deptId, JSON.stringify(gridObj));
    return await this.getDepartmentById(deptId);
  }

  // ==========================================
  // ACTIVITY GALLERY BUSINESS LOGIC
  // ==========================================

  static async getActivityGallery(deptId: number) {
    const eventsStr = await DepartmentRepository.getActivityGalleryByDept(deptId);
    if (!eventsStr) return { events: [] };
    return { events: JSON.parse(eventsStr) };
  }

  static async saveActivityGallery(deptId: number, events: any[]) {
    await DepartmentRepository.saveActivityGallery(deptId, JSON.stringify(events));
    return await this.getActivityGallery(deptId);
  }
}
