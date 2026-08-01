"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyController = void 0;
const facultyService_1 = require("../services/facultyService");
class FacultyController {
    // POST /api/admin/faculties
    static async addFaculty(req, res, next) {
        try {
            const { dept_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index, } = req.body;
            const faculty = await facultyService_1.FacultyService.addFaculty(dept_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index);
            return res.status(200).json(faculty);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/faculties/:id
    static async updateFaculty(req, res, next) {
        try {
            const id = Number(req.params.id);
            const fields = req.body;
            const faculty = await facultyService_1.FacultyService.updateFaculty(id, fields);
            return res.status(200).json(faculty);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/remove-faculty/:id
    static async deleteFaculty(req, res, next) {
        try {
            const id = Number(req.params.id);
            await facultyService_1.FacultyService.deleteFaculty(id);
            return res.status(200).json({ message: 'Faculty removed' });
        }
        catch (error) {
            next(error);
        }
    }
    // GET /api/admin/faculties-all
    static async getAllFaculties(req, res, next) {
        try {
            const faculties = await facultyService_1.FacultyService.getAllFacultiesWithEmpId();
            return res.status(200).json(faculties);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FacultyController = FacultyController;
exports.default = FacultyController;
