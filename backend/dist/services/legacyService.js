"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LegacyService = void 0;
const legacyRepository_1 = require("../repositories/legacyRepository");
const facultyRepository_1 = require("../repositories/facultyRepository");
class LegacyService {
    // Fetch dashboard stats from legacy tables
    static async getDashboardStats() {
        const counts = await legacyRepository_1.LegacyRepository.getDashboardCounts();
        return {
            total_publications: counts.publications,
            total_foreign_visits: counts.foreignVisits,
            total_events_organized: counts.organizers,
        };
    }
    // Helper: batch-resolve faculty info for a list of legacy records
    static async attachFacultyInfo(records) {
        const empIds = Array.from(new Set(records.map((r) => r.emp_id).filter(Boolean)));
        if (empIds.length === 0)
            return records;
        // 1. Get emails for these employee IDs from legacy employee_master
        const empEmailList = await legacyRepository_1.LegacyRepository.resolveEmailsByEmpIds(empIds);
        const empEmailMap = new Map(); // empId -> email
        empEmailList.forEach((item) => {
            if (item.email) {
                empEmailMap.set(item.emp_id, item.email);
            }
        });
        // 2. Fetch all faculties and map them by email
        const faculties = await facultyRepository_1.FacultyRepository.getAllWithDeptName();
        const facultyMap = new Map(); // email -> faculty details
        faculties.forEach((f) => {
            if (f.email) {
                facultyMap.set(f.email.trim().toLowerCase(), {
                    faculty_id: f.id,
                    faculty_name: f.name,
                    faculty_email: f.email,
                    department_name: f.department_name || '',
                });
            }
        });
        // 3. Map info back to records
        return records.map((r) => {
            const email = r.emp_id ? empEmailMap.get(String(r.emp_id)) : null;
            const fInfo = email ? facultyMap.get(email) : null;
            return {
                ...r,
                faculty_id: fInfo ? fInfo.faculty_id : null,
                faculty_name: fInfo ? fInfo.faculty_name : 'N/A',
                faculty_email: fInfo ? fInfo.faculty_email : 'N/A',
                department_name: fInfo ? fInfo.department_name : 'N/A',
            };
        });
    }
    // Helper: resolve matching emp_ids for a search term
    static async getMatchingEmpIdsForSearch(search) {
        if (!search)
            return undefined;
        // Search faculties matching name or email in primary DB
        const faculties = await facultyRepository_1.FacultyRepository.getAllWithDeptName();
        const searchLower = search.toLowerCase();
        const matchingFacs = faculties.filter((f) => (f.name && f.name.toLowerCase().includes(searchLower)) ||
            (f.email && f.email.toLowerCase().includes(searchLower)));
        const emails = matchingFacs
            .map((f) => (f.email ? f.email.trim().toLowerCase() : ''))
            .filter(Boolean);
        if (emails.length === 0)
            return ['__NONE_MATCHING__']; // Return dummy to ensure no results match
        return await legacyRepository_1.LegacyRepository.resolveEmpIdsByEmails(emails);
    }
    // ==========================================
    // FOREIGN VISITS
    // ==========================================
    static async listForeignVisits(options) {
        const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
        const { data, total } = await legacyRepository_1.LegacyRepository.listForeignVisits({
            ...options,
            matchingEmpIds,
        });
        const attached = await this.attachFacultyInfo(data);
        return { data: attached, total };
    }
    static async addForeignVisit(data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        const insertId = await legacyRepository_1.LegacyRepository.addForeignVisit({
            emp_id: empId || null,
            company: data.company || null,
            purpose: data.purpose || null,
            dfrom: data.dfrom || null,
            dto: data.dto || null,
            agency: data.agency || null,
            invitation: data.invitation || null,
            certificate: data.certificate || null,
        });
        return { id: insertId, emp_id: empId, ...data };
    }
    static async updateForeignVisit(id, data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        await legacyRepository_1.LegacyRepository.updateForeignVisit(id, {
            emp_id: empId,
            company: data.company,
            purpose: data.purpose,
            dfrom: data.dfrom,
            dto: data.dto,
            agency: data.agency,
            invitation: data.invitation,
            certificate: data.certificate,
        });
    }
    static async deleteForeignVisit(id) {
        await legacyRepository_1.LegacyRepository.deleteForeignVisit(id);
    }
    static generateForeignVisitsCsv(records) {
        const headers = ['ID', 'Employee ID', 'Faculty Name', 'Faculty Email', 'Department', 'Country / Company', 'Purpose of Visit', 'From Date', 'To Date', 'Agency', 'Invitation Details', 'Certificate Details'];
        const rows = records.map((r) => [
            r.id,
            r.emp_id || '',
            r.faculty_name || 'N/A',
            r.faculty_email || 'N/A',
            r.department_name || 'N/A',
            r.company || '',
            r.purpose || '',
            r.dfrom || '',
            r.dto || '',
            r.agency || '',
            r.invitation || '',
            r.certificate || '',
        ]);
        return [headers.join(','), ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    }
    // ==========================================
    // ORGANIZERS (EVENTS ORGANIZED)
    // ==========================================
    static async listOrganizers(options) {
        const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
        const { data, total } = await legacyRepository_1.LegacyRepository.listOrganizers({
            ...options,
            matchingEmpIds,
        });
        const attached = await this.attachFacultyInfo(data);
        return { data: attached, total };
    }
    static async addOrganizer(data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        const insertId = await legacyRepository_1.LegacyRepository.addOrganizer({
            ...data,
            emp_id: empId || null,
        });
        return { id: insertId, emp_id: empId, ...data };
    }
    static async updateOrganizer(id, data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        await legacyRepository_1.LegacyRepository.updateOrganizer(id, {
            ...data,
            emp_id: empId,
        });
    }
    static async deleteOrganizer(id) {
        await legacyRepository_1.LegacyRepository.deleteOrganizer(id);
    }
    static generateOrganizersCsv(records) {
        const headers = ['ID', 'Employee ID', 'Faculty Name', 'Faculty Email', 'Department', 'Title of Event', 'Event Type', 'Level', 'Role', 'Date From', 'Date To', 'Organizer', 'Sanctioned Amount', 'Utilized Amount'];
        const rows = records.map((r) => [
            r.id,
            r.emp_id || '',
            r.faculty_name || 'N/A',
            r.faculty_email || 'N/A',
            r.department_name || 'N/A',
            r.Title || '',
            r.O_type || '',
            r.Level || '',
            r.Role || '',
            r.Date_f || '',
            r.Date_t || '',
            r.Org || '',
            r.Sanctioned || '',
            r.Utilized || '',
        ]);
        return [headers.join(','), ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    }
    // ==========================================
    // PUBLICATIONS
    // ==========================================
    static async listPublications(options) {
        const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
        const { data, total } = await legacyRepository_1.LegacyRepository.listPublications({
            ...options,
            matchingEmpIds,
        });
        const attached = await this.attachFacultyInfo(data);
        return { data: attached, total };
    }
    static async addPublication(data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        const insertId = await legacyRepository_1.LegacyRepository.addPublication({
            ...data,
            emp_id: empId || null,
        });
        return { id: insertId, emp_id: empId, ...data };
    }
    static async updatePublication(id, data) {
        let empId = data.emp_id;
        if (data.faculty_email) {
            const resolved = await legacyRepository_1.LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
            if (resolved)
                empId = resolved;
        }
        await legacyRepository_1.LegacyRepository.updatePublication(id, {
            ...data,
            emp_id: empId,
        });
    }
    static async deletePublication(id) {
        await legacyRepository_1.LegacyRepository.deletePublication(id);
    }
    static generatePublicationsCsv(records) {
        const headers = ['ID', 'Employee ID', 'Faculty Name', 'Faculty Email', 'Department', 'Title', 'Journal/Publisher', 'Type', 'Level', 'Authors', 'Year', 'Month', 'DOI'];
        const rows = records.map((r) => {
            const authors = [r.Author_1, r.Author_2, r.Author_3].filter(Boolean).join(', ');
            return [
                r.id,
                r.emp_id || '',
                r.faculty_name || 'N/A',
                r.faculty_email || 'N/A',
                r.department_name || 'N/A',
                r.Title || '',
                r.P_Name || r.Publisher || '',
                r.P_type || '',
                r.P_Level || '',
                authors,
                r.P_year || '',
                r.P_month || '',
                r.DOI || '',
            ];
        });
        return [headers.join(','), ...rows.map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');
    }
}
exports.LegacyService = LegacyService;
