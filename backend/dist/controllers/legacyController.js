"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyController = void 0;
const legacyService_1 = require("../services/legacyService");
class LegacyController {
    // GET /api/admin/dashboard-stats
    static async getDashboardStats(req, res, next) {
        try {
            const stats = await legacyService_1.LegacyService.getDashboardStats();
            return res.status(200).json(stats);
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // FOREIGN VISITS
    // ==========================================
    // GET /api/admin/foreign-visits
    static async listForeignVisits(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
            const exportAll = req.query.export === 'true';
            const result = await legacyService_1.LegacyService.listForeignVisits({
                page,
                limit,
                search,
                empId,
                exportAll,
            });
            if (exportAll) {
                const csvContent = legacyService_1.LegacyService.generateForeignVisitsCsv(result.data);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=foreign_visits.csv');
                return res.status(200).send(csvContent);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/foreign-visits
    static async addForeignVisit(req, res, next) {
        try {
            const result = await legacyService_1.LegacyService.addForeignVisit(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/foreign-visits/:id
    static async updateForeignVisit(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.updateForeignVisit(id, req.body);
            return res.status(200).json({ message: 'Foreign visit record updated successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/admin/foreign-visits/:id
    static async deleteForeignVisit(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.deleteForeignVisit(id);
            return res.status(200).json({ message: 'Foreign visit record deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // ORGANIZERS
    // ==========================================
    // GET /api/admin/organizers
    static async listOrganizers(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
            const exportAll = req.query.export === 'true';
            const result = await legacyService_1.LegacyService.listOrganizers({
                page,
                limit,
                search,
                empId,
                exportAll,
            });
            if (exportAll) {
                const csvContent = legacyService_1.LegacyService.generateOrganizersCsv(result.data);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=organizers.csv');
                return res.status(200).send(csvContent);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/organizers
    static async addOrganizer(req, res, next) {
        try {
            const result = await legacyService_1.LegacyService.addOrganizer(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/organizers/:id
    static async updateOrganizer(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.updateOrganizer(id, req.body);
            return res.status(200).json({ message: 'Organizer record updated successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/admin/organizers/:id
    static async deleteOrganizer(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.deleteOrganizer(id);
            return res.status(200).json({ message: 'Organizer record deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
    // ==========================================
    // PUBLICATIONS
    // ==========================================
    // GET /api/admin/publications
    static async listPublications(req, res, next) {
        try {
            const page = req.query.page ? Number(req.query.page) : 1;
            const limit = req.query.limit ? Number(req.query.limit) : 10;
            const search = req.query.search ? String(req.query.search) : undefined;
            const empId = req.query.emp_id ? String(req.query.emp_id) : undefined;
            const exportAll = req.query.export === 'true';
            const result = await legacyService_1.LegacyService.listPublications({
                page,
                limit,
                search,
                empId,
                exportAll,
            });
            if (exportAll) {
                const csvContent = legacyService_1.LegacyService.generatePublicationsCsv(result.data);
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename=publications.csv');
                return res.status(200).send(csvContent);
            }
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // POST /api/admin/publications
    static async addPublication(req, res, next) {
        try {
            const result = await legacyService_1.LegacyService.addPublication(req.body);
            return res.status(200).json(result);
        }
        catch (error) {
            next(error);
        }
    }
    // PUT /api/admin/publications/:id
    static async updatePublication(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.updatePublication(id, req.body);
            return res.status(200).json({ message: 'Publication record updated successfully.' });
        }
        catch (error) {
            next(error);
        }
    }
    // DELETE /api/admin/publications/:id
    static async deletePublication(req, res, next) {
        try {
            const id = Number(req.params.id);
            await legacyService_1.LegacyService.deletePublication(id);
            return res.status(200).json({ message: 'Publication record deleted successfully' });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LegacyController = LegacyController;
exports.default = LegacyController;
