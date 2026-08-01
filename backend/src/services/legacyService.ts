import { LegacyRepository } from '../repositories/legacyRepository';
import { FacultyRepository } from '../repositories/facultyRepository';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export class LegacyService {
  
  // Fetch dashboard stats from legacy tables
  static async getDashboardStats() {
    const counts = await LegacyRepository.getDashboardCounts();
    return {
      total_publications: counts.publications,
      total_foreign_visits: counts.foreignVisits,
      total_events_organized: counts.organizers,
    };
  }

  // Helper: batch-resolve faculty info for a list of legacy records
  private static async attachFacultyInfo(records: any[]): Promise<any[]> {
    const empIds = Array.from(new Set(records.map((r) => r.emp_id).filter(Boolean))) as string[];
    if (empIds.length === 0) return records;

    // 1. Get emails for these employee IDs from legacy employee_master
    const empEmailList = await LegacyRepository.resolveEmailsByEmpIds(empIds);
    const empEmailMap = new Map<string, string>(); // empId -> email
    empEmailList.forEach((item) => {
      if (item.email) {
        empEmailMap.set(item.emp_id, item.email);
      }
    });

    // 2. Fetch all faculties and map them by email
    const faculties = await FacultyRepository.getAllWithDeptName();
    const facultyMap = new Map<string, any>(); // email -> faculty details
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
  private static async getMatchingEmpIdsForSearch(search?: string): Promise<string[] | undefined> {
    if (!search) return undefined;
    
    // Search faculties matching name or email in primary DB
    const faculties = await FacultyRepository.getAllWithDeptName();
    const searchLower = search.toLowerCase();
    const matchingFacs = faculties.filter(
      (f) =>
        (f.name && f.name.toLowerCase().includes(searchLower)) ||
        (f.email && f.email.toLowerCase().includes(searchLower))
    );

    const emails = matchingFacs
      .map((f) => (f.email ? f.email.trim().toLowerCase() : ''))
      .filter(Boolean);

    if (emails.length === 0) return ['__NONE_MATCHING__']; // Return dummy to ensure no results match

    return await LegacyRepository.resolveEmpIdsByEmails(emails);
  }

  // ==========================================
  // FOREIGN VISITS
  // ==========================================

  static async listForeignVisits(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    exportAll?: boolean;
  }) {
    const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
    const { data, total } = await LegacyRepository.listForeignVisits({
      ...options,
      matchingEmpIds,
    });

    const attached = await this.attachFacultyInfo(data);
    return { data: attached, total };
  }

  static async addForeignVisit(data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    const insertId = await LegacyRepository.addForeignVisit({
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

  static async updateForeignVisit(id: number, data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    await LegacyRepository.updateForeignVisit(id, {
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

  static async deleteForeignVisit(id: number) {
    await LegacyRepository.deleteForeignVisit(id);
  }

  static generateForeignVisitsCsv(records: any[]): string {
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

  static async listOrganizers(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    exportAll?: boolean;
  }) {
    const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
    const { data, total } = await LegacyRepository.listOrganizers({
      ...options,
      matchingEmpIds,
    });

    const attached = await this.attachFacultyInfo(data);
    return { data: attached, total };
  }

  static async addOrganizer(data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    const insertId = await LegacyRepository.addOrganizer({
      ...data,
      emp_id: empId || null,
    });

    return { id: insertId, emp_id: empId, ...data };
  }

  static async updateOrganizer(id: number, data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    await LegacyRepository.updateOrganizer(id, {
      ...data,
      emp_id: empId,
    });
  }

  static async deleteOrganizer(id: number) {
    await LegacyRepository.deleteOrganizer(id);
  }

  static generateOrganizersCsv(records: any[]): string {
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

  static async listPublications(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    exportAll?: boolean;
  }) {
    const matchingEmpIds = await this.getMatchingEmpIdsForSearch(options.search);
    const { data, total } = await LegacyRepository.listPublications({
      ...options,
      matchingEmpIds,
    });

    const attached = await this.attachFacultyInfo(data);
    return { data: attached, total };
  }

  static async addPublication(data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    const insertId = await LegacyRepository.addPublication({
      ...data,
      emp_id: empId || null,
    });

    return { id: insertId, emp_id: empId, ...data };
  }

  static async updatePublication(id: number, data: any) {
    let empId = data.emp_id;
    if (data.faculty_email) {
      const resolved = await LegacyRepository.resolveEmpIdByEmail(data.faculty_email);
      if (resolved) empId = resolved;
    }

    await LegacyRepository.updatePublication(id, {
      ...data,
      emp_id: empId,
    });
  }

  static async deletePublication(id: number) {
    await LegacyRepository.deletePublication(id);
  }

  static generatePublicationsCsv(records: any[]): string {
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
