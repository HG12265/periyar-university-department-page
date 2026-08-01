"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentService = void 0;
const departmentRepository_1 = require("../repositories/departmentRepository");
const facultyRepository_1 = require("../repositories/facultyRepository");
const ApiError_1 = require("../utils/ApiError");
class DepartmentService {
    // Get list of departments
    static async getAllDepartments() {
        return await departmentRepository_1.DepartmentRepository.getAll();
    }
    // Get department details by slug (with sections, links, faculties, and tables)
    static async getDepartmentBySlug(slug) {
        const dept = await departmentRepository_1.DepartmentRepository.findBySlug(slug);
        if (!dept) {
            throw new ApiError_1.ApiError(404, 'Department not found');
        }
        return await this.compileDepartmentFullData(dept);
    }
    // Get department details by ID (for admin operations)
    static async getDepartmentById(id) {
        const dept = await departmentRepository_1.DepartmentRepository.findById(id);
        if (!dept) {
            throw new ApiError_1.ApiError(404, 'Department not found');
        }
        const sections = await departmentRepository_1.DepartmentRepository.getSectionsByDept(dept.id);
        const navLinks = await departmentRepository_1.DepartmentRepository.getNavLinksByDept(dept.id);
        const faculties = await facultyRepository_1.FacultyRepository.getByDept(dept.id);
        const facilities = await departmentRepository_1.DepartmentRepository.getFacilitiesByDept(dept.id);
        let facilitiesTableParsed = { columns: [], rows: [], table_title: '' };
        if (dept.facilities_table) {
            try {
                facilitiesTableParsed = JSON.parse(dept.facilities_table);
            }
            catch (e) {
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
    static async compileDepartmentFullData(dept) {
        const sections = await departmentRepository_1.DepartmentRepository.getSectionsByDept(dept.id);
        const navLinks = await departmentRepository_1.DepartmentRepository.getNavLinksByDept(dept.id);
        const faculties = await facultyRepository_1.FacultyRepository.getByDept(dept.id);
        const facilities = await departmentRepository_1.DepartmentRepository.getFacilitiesByDept(dept.id);
        // Fetch and parse Alumni Table
        let alumniData = null;
        const alumniRaw = await departmentRepository_1.DepartmentRepository.getAlumniByDept(dept.id);
        if (alumniRaw) {
            try {
                alumniData = {
                    columns: JSON.parse(alumniRaw.columns),
                    rows: JSON.parse(alumniRaw.rows),
                    meeting_title: alumniRaw.meeting_title || '',
                    meeting_images: alumniRaw.meeting_images ? JSON.parse(alumniRaw.meeting_images) : []
                };
            }
            catch (e) {
                alumniData = { columns: [], rows: [], meeting_title: '', meeting_images: [] };
            }
        }
        // Fetch and parse Placement Table
        let placementData = null;
        const placementRaw = await departmentRepository_1.DepartmentRepository.getPlacementByDept(dept.id);
        if (placementRaw) {
            try {
                placementData = {
                    columns: JSON.parse(placementRaw.columns),
                    rows: JSON.parse(placementRaw.rows),
                    meeting_title: placementRaw.meeting_title || '',
                    meeting_images: placementRaw.meeting_images ? JSON.parse(placementRaw.meeting_images) : []
                };
            }
            catch (e) {
                placementData = { columns: [], rows: [], meeting_title: '', meeting_images: [] };
            }
        }
        // Parse Facilities Table
        let facilitiesTableParsed = { columns: [], rows: [], table_title: '' };
        if (dept.facilities_table) {
            try {
                facilitiesTableParsed = JSON.parse(dept.facilities_table);
            }
            catch (e) {
                // Ignore JSON error
            }
        }
        // Fetch and parse Activity Gallery
        let activityGallery = { events: [] };
        const activityRaw = await departmentRepository_1.DepartmentRepository.getActivityGalleryByDept(dept.id);
        if (activityRaw) {
            try {
                activityGallery = {
                    events: JSON.parse(activityRaw)
                };
            }
            catch (e) {
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
    static async createDepartment(name, slug, title, bannerImage) {
        const existing = await departmentRepository_1.DepartmentRepository.findBySlug(slug);
        if (existing) {
            throw new ApiError_1.ApiError(400, `Slug '${slug}' is already taken.`);
        }
        const id = await departmentRepository_1.DepartmentRepository.create(name, slug, title, bannerImage);
        return await this.getDepartmentById(id);
    }
    // Update Department (Super Admin)
    static async updateDepartment(id, name, slug, title, bannerImage) {
        if (slug) {
            const existing = await departmentRepository_1.DepartmentRepository.findBySlug(slug);
            if (existing && existing.id !== id) {
                throw new ApiError_1.ApiError(400, `Slug '${slug}' is already taken.`);
            }
        }
        await departmentRepository_1.DepartmentRepository.update(id, name, slug, title, bannerImage);
        return await this.getDepartmentById(id);
    }
    // Delete Department (Super Admin)
    static async deleteDepartment(id) {
        const existing = await departmentRepository_1.DepartmentRepository.findById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Department not found');
        }
        await departmentRepository_1.DepartmentRepository.delete(id);
    }
    // ==========================================
    // SECTIONS BUSINESS LOGIC
    // ==========================================
    static async addSection(deptId, title, category, content, orderIndex = 0) {
        const dept = await departmentRepository_1.DepartmentRepository.findById(deptId);
        if (!dept) {
            throw new ApiError_1.ApiError(404, 'Department not found');
        }
        const id = await departmentRepository_1.DepartmentRepository.addSection(deptId, title, category, content, orderIndex);
        return await departmentRepository_1.DepartmentRepository.findSectionById(id);
    }
    static async updateSection(id, title, content, category, orderIndex) {
        const existing = await departmentRepository_1.DepartmentRepository.findSectionById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Section not found');
        }
        await departmentRepository_1.DepartmentRepository.updateSection(id, title, content, category, orderIndex);
        return await departmentRepository_1.DepartmentRepository.findSectionById(id);
    }
    static async deleteSection(id) {
        const existing = await departmentRepository_1.DepartmentRepository.findSectionById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Section not found');
        }
        await departmentRepository_1.DepartmentRepository.deleteSection(id);
    }
    // ==========================================
    // NAV LINKS BUSINESS LOGIC
    // ==========================================
    static async addNavLink(deptId, label, url, orderIndex = 0) {
        const dept = await departmentRepository_1.DepartmentRepository.findById(deptId);
        if (!dept) {
            throw new ApiError_1.ApiError(404, 'Department not found');
        }
        const id = await departmentRepository_1.DepartmentRepository.addNavLink(deptId, label, url, orderIndex);
        return { id, dept_id: deptId, label, url, order_index: orderIndex };
    }
    static async deleteNavLink(id) {
        await departmentRepository_1.DepartmentRepository.deleteNavLink(id);
    }
    // ==========================================
    // ALUMNI AND PLACEMENT BUSINESS LOGIC
    // ==========================================
    static async getAlumni(deptId) {
        const data = await departmentRepository_1.DepartmentRepository.getAlumniByDept(deptId);
        if (!data)
            return { columns: [], rows: [], meeting_title: '', meeting_images: [] };
        return {
            columns: JSON.parse(data.columns),
            rows: JSON.parse(data.rows),
            meeting_title: data.meeting_title || '',
            meeting_images: data.meeting_images ? JSON.parse(data.meeting_images) : []
        };
    }
    static async saveAlumni(deptId, columns, rows, meetingTitle, meetingImages) {
        const colsStr = JSON.stringify(columns);
        const rowsStr = JSON.stringify(rows);
        const imgsStr = meetingImages ? JSON.stringify(meetingImages) : null;
        await departmentRepository_1.DepartmentRepository.saveAlumni(deptId, colsStr, rowsStr, meetingTitle, imgsStr);
        return await this.getAlumni(deptId);
    }
    static async getPlacement(deptId) {
        const data = await departmentRepository_1.DepartmentRepository.getPlacementByDept(deptId);
        if (!data)
            return { columns: [], rows: [], meeting_title: '', meeting_images: [] };
        return {
            columns: JSON.parse(data.columns),
            rows: JSON.parse(data.rows),
            meeting_title: data.meeting_title || '',
            meeting_images: data.meeting_images ? JSON.parse(data.meeting_images) : []
        };
    }
    static async savePlacement(deptId, columns, rows, meetingTitle, meetingImages) {
        const colsStr = JSON.stringify(columns);
        const rowsStr = JSON.stringify(rows);
        const imgsStr = meetingImages ? JSON.stringify(meetingImages) : null;
        await departmentRepository_1.DepartmentRepository.savePlacement(deptId, colsStr, rowsStr, meetingTitle, imgsStr);
        return await this.getPlacement(deptId);
    }
    // ==========================================
    // FACILITIES BUSINESS LOGIC
    // ==========================================
    static async addFacility(deptId, title, imageUrl, linkUrl, orderIndex = 0) {
        const id = await departmentRepository_1.DepartmentRepository.addFacility(deptId, title, imageUrl, linkUrl, orderIndex);
        return await departmentRepository_1.DepartmentRepository.findFacilityById(id);
    }
    static async updateFacility(id, title, imageUrl, linkUrl, orderIndex) {
        const existing = await departmentRepository_1.DepartmentRepository.findFacilityById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Facility not found');
        }
        await departmentRepository_1.DepartmentRepository.updateFacility(id, title, imageUrl, linkUrl, orderIndex);
        return await departmentRepository_1.DepartmentRepository.findFacilityById(id);
    }
    static async deleteFacility(id) {
        const existing = await departmentRepository_1.DepartmentRepository.findFacilityById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Facility not found');
        }
        await departmentRepository_1.DepartmentRepository.deleteFacility(id);
    }
    static async saveFacilitiesConfig(deptId, reqTitle, reqFile, btnLabel, btnUrl) {
        await departmentRepository_1.DepartmentRepository.saveFacilitiesConfig(deptId, reqTitle, reqFile, btnLabel, btnUrl);
        return await this.getDepartmentById(deptId);
    }
    static async saveFacilitiesTable(deptId, columns, rows, tableTitle) {
        const gridObj = { columns, rows, table_title: tableTitle };
        await departmentRepository_1.DepartmentRepository.saveFacilitiesTable(deptId, JSON.stringify(gridObj));
        return await this.getDepartmentById(deptId);
    }
    // ==========================================
    // ACTIVITY GALLERY BUSINESS LOGIC
    // ==========================================
    static async getActivityGallery(deptId) {
        const eventsStr = await departmentRepository_1.DepartmentRepository.getActivityGalleryByDept(deptId);
        if (!eventsStr)
            return { events: [] };
        return { events: JSON.parse(eventsStr) };
    }
    static async saveActivityGallery(deptId, events) {
        await departmentRepository_1.DepartmentRepository.saveActivityGallery(deptId, JSON.stringify(events));
        return await this.getActivityGallery(deptId);
    }
}
exports.DepartmentService = DepartmentService;
