"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeptController = void 0;
const departmentService_1 = require("../services/departmentService");
const museumScraper_1 = require("../utils/museumScraper");
class DeptController {
    // GET /api/departments
    static async getDepartments(req, res, next) {
        try {
            const depts = await departmentService_1.DepartmentService.getAllDepartments();
            return res.status(200).json(depts);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/departments/:slug
    static async getDepartmentBySlug(req, res, next) {
        try {
            const { slug } = req.params;
            const dept = await departmentService_1.DepartmentService.getDepartmentBySlug(slug);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/admin/list-departments
    static async adminListDepartments(req, res, next) {
        try {
            const depts = await departmentService_1.DepartmentService.getAllDepartments();
            return res.status(200).json(depts);
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/admin/departments/:id
    static async adminGetDepartment(req, res, next) {
        try {
            const id = Number(req.params.id);
            const dept = await departmentService_1.DepartmentService.getDepartmentById(id);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/departments
    static async createDepartment(req, res, next) {
        try {
            const { name, slug, title, banner_image } = req.query; // Python reads these from query params!
            const nameStr = name ? String(name) : '';
            const slugStr = slug ? String(slug) : '';
            const titleStr = title ? String(title) : undefined;
            const bannerStr = banner_image ? String(banner_image) : undefined;
            const dept = await departmentService_1.DepartmentService.createDepartment(nameStr, slugStr, titleStr, bannerStr);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/departments/:id
    static async updateDepartment(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { name, slug, title, banner_image } = req.query; // Python reads from query params!
            const nameStr = name ? String(name) : undefined;
            const slugStr = slug ? String(slug) : undefined;
            const titleStr = title ? String(title) : undefined;
            const bannerStr = banner_image ? String(banner_image) : undefined;
            const dept = await departmentService_1.DepartmentService.updateDepartment(id, nameStr, slugStr, titleStr, bannerStr);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/admin/departments/:id
    static async deleteDepartment(req, res, next) {
        try {
            const id = Number(req.params.id);
            await departmentService_1.DepartmentService.deleteDepartment(id);
            return res.status(200).json({ message: 'Department deleted' });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // SECTIONS
    // ==========================================
    // POST /api/admin/sections
    static async addSection(req, res, next) {
        try {
            const { dept_id, section_title, category, content, order_index } = req.body;
            const section = await departmentService_1.DepartmentService.addSection(dept_id, section_title, category, content, order_index);
            return res.status(200).json(section);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/sections/:id
    static async updateSection(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { section_title, content, category, order_index } = req.body;
            const section = await departmentService_1.DepartmentService.updateSection(id, section_title, content, category, order_index);
            return res.status(200).json(section);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/remove-section/:id
    static async deleteSection(req, res, next) {
        try {
            const id = Number(req.params.id);
            await departmentService_1.DepartmentService.deleteSection(id);
            return res.status(200).json({ message: 'Section removed' });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // NAV LINKS
    // ==========================================
    // POST /api/admin/nav-links
    static async addNavLink(req, res, next) {
        try {
            const { dept_id, label, url, order_index } = req.body;
            const link = await departmentService_1.DepartmentService.addNavLink(dept_id, label, url, order_index);
            return res.status(200).json(link);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/remove-link/:id
    static async deleteNavLink(req, res, next) {
        try {
            const id = Number(req.params.id);
            await departmentService_1.DepartmentService.deleteNavLink(id);
            return res.status(200).json({ message: 'Nav link removed' });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // ALUMNI
    // ==========================================
    // GET /api/admin/alumni/:dept_id
    static async getAlumni(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const data = await departmentService_1.DepartmentService.getAlumni(deptId);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/alumni/:dept_id
    static async saveAlumni(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const { columns, rows, meeting_title, meeting_images } = req.body;
            const data = await departmentService_1.DepartmentService.saveAlumni(deptId, columns, rows, meeting_title, meeting_images);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // PLACEMENT
    // ==========================================
    // GET /api/admin/placement/:dept_id
    static async getPlacement(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const data = await departmentService_1.DepartmentService.getPlacement(deptId);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/placement/:dept_id
    static async savePlacement(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const { columns, rows, meeting_title, meeting_images } = req.body;
            const data = await departmentService_1.DepartmentService.savePlacement(deptId, columns, rows, meeting_title, meeting_images);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // FACILITIES
    // ==========================================
    // POST /api/admin/facilities
    static async addFacility(req, res, next) {
        try {
            const { dept_id, title, image_url, link_url, order_index } = req.body;
            const facility = await departmentService_1.DepartmentService.addFacility(dept_id, title, image_url, link_url, order_index);
            return res.status(200).json(facility);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/facilities/:id
    static async updateFacility(req, res, next) {
        try {
            const id = Number(req.params.id);
            const { title, image_url, link_url, order_index } = req.body;
            const facility = await departmentService_1.DepartmentService.updateFacility(id, title, image_url, link_url, order_index);
            return res.status(200).json(facility);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/remove-facility/:id
    static async deleteFacility(req, res, next) {
        try {
            const id = Number(req.params.id);
            await departmentService_1.DepartmentService.deleteFacility(id);
            return res.status(200).json({ message: 'Facility removed' });
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/departments/:dept_id/facilities-config
    static async saveFacilitiesConfig(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const { facilities_req_title, facilities_req_file, facilities_btn_label, facilities_btn_url } = req.body;
            const dept = await departmentService_1.DepartmentService.saveFacilitiesConfig(deptId, facilities_req_title, facilities_req_file, facilities_btn_label, facilities_btn_url);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/departments/:dept_id/facilities-table
    static async saveFacilitiesTable(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const { columns, rows, table_title } = req.body;
            const dept = await departmentService_1.DepartmentService.saveFacilitiesTable(deptId, columns, rows, table_title);
            return res.status(200).json(dept);
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // ACTIVITY GALLERY
    // ==========================================
    // GET /api/admin/activity-gallery/:dept_id
    static async getActivityGallery(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const data = await departmentService_1.DepartmentService.getActivityGallery(deptId);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/activity-gallery/:dept_id
    static async saveActivityGallery(req, res, next) {
        try {
            const deptId = Number(req.params.dept_id);
            const { events } = req.body;
            const data = await departmentService_1.DepartmentService.saveActivityGallery(deptId, events);
            return res.status(200).json(data);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/scrape-museum
    static async scrapeMuseum(req, res, next) {
        try {
            const result = await museumScraper_1.MuseumScraper.scrapeAndSave();
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.DeptController = DeptController;
exports.default = DeptController;
