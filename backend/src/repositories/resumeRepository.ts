import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { primaryDB } from '../db';

export interface ResumeMaster {
  id: number;
  faculty_id: number;
  generated_resume_json: string;
  generated_pdf_url: string;
  created_at: Date;
  updated_at: Date;
}

export interface AdminResumeListItem {
  id: number;
  faculty_id: number;
  faculty_name: string;
  faculty_email: string | null;
  faculty_designation: string | null;
  department_name: string;
  generated_pdf_url: string;
  created_at: Date;
  updated_at: Date;
}

export class ResumeRepository {
  // Find resume by faculty ID
  static async findByFacultyId(facultyId: number): Promise<ResumeMaster | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, faculty_id, generated_resume_json, generated_pdf_url, created_at, updated_at FROM resume_master WHERE faculty_id = ? LIMIT 1',
      [facultyId]
    );
    if (rows.length === 0) return null;
    return rows[0] as ResumeMaster;
  }

  // Find resume by ID
  static async findById(id: number): Promise<ResumeMaster | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, faculty_id, generated_resume_json, generated_pdf_url, created_at, updated_at FROM resume_master WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as ResumeMaster;
  }

  // Save (insert or update) resume
  static async save(facultyId: number, json: string, pdfUrl: string): Promise<void> {
    await primaryDB.query(
      'INSERT INTO resume_master (faculty_id, generated_resume_json, generated_pdf_url, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW()) ' +
      'ON DUPLICATE KEY UPDATE generated_resume_json = VALUES(generated_resume_json), generated_pdf_url = VALUES(generated_pdf_url), updated_at = NOW()',
      [facultyId, json, pdfUrl]
    );
  }

  // Delete resume
  static async delete(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM resume_master WHERE id = ?', [id]);
  }

  // List all resumes for admin, with filter options and joins with Faculty and Department
  static async listAllForAdmin(filters: {
    search?: string;
    email?: string;
    deptId?: number;
  }): Promise<AdminResumeListItem[]> {
    let sql = `
      SELECT 
        rm.id, 
        rm.faculty_id, 
        f.name AS faculty_name, 
        f.email AS faculty_email, 
        f.designation AS faculty_designation, 
        COALESCE(d.name, 'N/A') AS department_name, 
        rm.generated_pdf_url, 
        rm.created_at, 
        rm.updated_at 
      FROM resume_master rm
      INNER JOIN faculties f ON rm.faculty_id = f.id
      LEFT JOIN departments d ON f.dept_id = d.id
    `;
    const params: any[] = [];
    const whereClauses: string[] = [];

    if (filters.search) {
      whereClauses.push('f.name LIKE ?');
      params.push(`%${filters.search}%`);
    }

    if (filters.email) {
      whereClauses.push('f.email LIKE ?');
      params.push(`%${filters.email}%`);
    }

    if (filters.deptId) {
      whereClauses.push('f.dept_id = ?');
      params.push(filters.deptId);
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const [rows] = await primaryDB.query<RowDataPacket[]>(sql, params);
    return rows as AdminResumeListItem[];
  }
}
