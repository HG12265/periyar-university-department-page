"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyService = void 0;
const facultyRepository_1 = require("../repositories/facultyRepository");
const legacyRepository_1 = require("../repositories/legacyRepository");
const ApiError_1 = require("../utils/ApiError");
class FacultyService {
    // Add a new faculty member
    static async addFaculty(deptId, name, designation, email, specialization, imageUrl, profileUrl, isFormer = 0, orderIndex = 0) {
        // 1. Proactively resolve emp_id from legacy DB if email is provided
        let empId;
        if (email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(email);
            if (resolved)
                empId = resolved;
        }
        const id = await facultyRepository_1.FacultyRepository.add(deptId, name, designation, email, specialization, imageUrl, profileUrl, isFormer, orderIndex, empId);
        const faculty = await facultyRepository_1.FacultyRepository.findById(id);
        if (!faculty)
            throw new ApiError_1.ApiError(500, 'Failed to retrieve created faculty');
        return faculty;
    }
    // Update a faculty member
    static async updateFaculty(id, fields) {
        const existing = await facultyRepository_1.FacultyRepository.findById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Faculty member not found');
        }
        // If email is changing, re-resolve emp_id from legacy DB
        if (fields.email && fields.email.trim().toLowerCase() !== (existing.email || '').trim().toLowerCase()) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(fields.email);
            fields.emp_id = resolved || null;
        }
        await facultyRepository_1.FacultyRepository.update(id, fields);
        const updated = await facultyRepository_1.FacultyRepository.findById(id);
        if (!updated)
            throw new ApiError_1.ApiError(500, 'Failed to retrieve updated faculty');
        return updated;
    }
    // Delete a faculty member
    static async deleteFaculty(id) {
        const existing = await facultyRepository_1.FacultyRepository.findById(id);
        if (!existing) {
            throw new ApiError_1.ApiError(404, 'Faculty member not found');
        }
        await facultyRepository_1.FacultyRepository.delete(id);
    }
    // Get all faculties with department name and resolved legacy emp_id
    static async getAllFacultiesWithEmpId() {
        const faculties = await facultyRepository_1.FacultyRepository.getAllWithDeptName();
        // Batch resolve employee IDs to optimize queries (avoid N+1 queries)
        const emails = faculties
            .map((f) => (f.email ? f.email.trim().toLowerCase() : ''))
            .filter((email) => email !== '');
        const resolvedMap = {};
        if (emails.length > 0) {
            const resolvedIds = await legacyRepository_1.LegacyRepository.resolveEmailsByEmpIds(faculties.map((f) => f.emp_id).filter((id) => id !== null));
            // Also query legacy database for emails in case emp_id wasn't stored yet
            const fallbackResolved = await legacyRepository_1.LegacyRepository.resolveEmpIdsByEmails(emails);
            // Resolve emails to ID maps
            const emailToIdMap = await legacyRepository_1.LegacyRepository.resolveEmailsByEmpIds(fallbackResolved);
            emailToIdMap.forEach((item) => {
                resolvedMap[item.email] = item.emp_id;
            });
        }
        return faculties.map((f) => {
            let resolvedEmpId = f.emp_id;
            if (!resolvedEmpId && f.email && resolvedMap[f.email.trim().toLowerCase()]) {
                resolvedEmpId = resolvedMap[f.email.trim().toLowerCase()];
            }
            return {
                id: f.id,
                name: f.name,
                email: f.email,
                designation: f.designation,
                emp_id: resolvedEmpId || null,
                department_name: f.department_name || 'N/A',
            };
        });
    }
}
exports.FacultyService = FacultyService;
