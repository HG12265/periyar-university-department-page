import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { resumeDB } from '../db';

export class LegacyRepository {
  // Resolve employee ID from employee_master by off_email
  static async resolveEmpIdByEmail(email: string): Promise<string | null> {
    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(
        'SELECT id FROM employee_master WHERE LOWER(TRIM(off_email)) = ? LIMIT 1',
        [email.trim().toLowerCase()]
      );
      if (rows.length === 0) return null;
      return String(rows[0].id);
    } catch (err) {
      // Soft fail for dev environment
      return null;
    }
  }

  // Resolve employee IDs from employee_master by list of emails
  static async resolveEmpIdsByEmails(emails: string[]): Promise<string[]> {
    if (emails.length === 0) return [];
    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(
        'SELECT id FROM employee_master WHERE LOWER(TRIM(off_email)) IN (?)',
        [emails]
      );
      return rows.map((r) => String(r.id));
    } catch (err) {
      return [];
    }
  }

  // Resolve employee emails from list of employee IDs
  static async resolveEmailsByEmpIds(empIds: string[]): Promise<{ emp_id: string; email: string }[]> {
    if (empIds.length === 0) return [];
    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(
        'SELECT id, off_email FROM employee_master WHERE id IN (?)',
        [empIds]
      );
      return rows.map((r) => ({
        emp_id: String(r.id),
        email: r.off_email ? r.off_email.trim().toLowerCase() : '',
      }));
    } catch (err) {
      return [];
    }
  }

  // Fetch qualifications (qualification_master)
  static async getQualifications(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT qualification, year_from, year_upto, mark, institute, status, arrange ' +
      'FROM qualification_master WHERE emp_id = ? ORDER BY arrange ASC, year_from ASC',
      [empId]
    );
    return rows;
  }

  // Fetch previous positions (previous_position)
  static async getPreviousPositions(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Institution, Designation, Department, FromDate, ToDate, Duration, Remarks ' +
      'FROM previous_position WHERE emp_id = ? ORDER BY FromDate DESC',
      [empId]
    );
    return rows;
  }

  // Fetch university positions (position_held)
  static async getUniversityPositions(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Role, Department, University, FromDate, ToDate, Responsibilities, Remarks ' +
      'FROM position_held WHERE emp_id = ? ORDER BY FromDate DESC',
      [empId]
    );
    return rows;
  }

  // Fetch awards (award)
  static async getAwards(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Title, A_date, Level, Sponcer, Spon_Address FROM award WHERE emp_id = ? ORDER BY A_date ASC',
      [empId]
    );
    return rows;
  }

  // Fetch research areas (area)
  static async getResearchAreas(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT area FROM area WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch projects (proposal)
  static async getProjects(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT title, FundAgency, samt, duration, Publications FROM proposal WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch patents (patent)
  static async getPatents(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Categry, Level, Name, Detail, Fdate, Issued, Stus, PNumber FROM patent WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch foreign visits (forigenvisite)
  static async getForeignVisits(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Company, Purpose, DFrom, DTo, Agency, Invitation, Certificate FROM forigenvisite WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch events organized (organizer)
  static async getEventsOrganized(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT T_role, O_type, Title, Date_f, Date_t, Level, Role, Org, Org_Address, local, outstation, Amount, letter, Sanctioned, Utilized, uc, report, photo1, photo2, photo3, photo4 ' +
      'FROM organizer WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch publications (publication)
  static async getPublications(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT P_type, Title, P_Name, P_Level, Author_1, Author_2, Author_3, Volume, Issue, Page_from, Page_to, Impact_F, Indexing, Publisher, P_year, P_month, DOI, Webpage, Paper, UPDATED ' +
      'FROM publication WHERE emp_id = ?',
      [empId]
    );
    return rows;
  }

  // Fetch lectures delivered (lectures_delivered)
  static async getLecturesDelivered(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Title, LType, Institution, Department, LDate, Venue, Mode, Description, EventTitle FROM lectures_delivered WHERE emp_id = ? ORDER BY LDate DESC',
      [empId]
    );
    return rows;
  }

  // Fetch copyrights (copyrights)
  static async getCopyrights(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT Title, CType, RegNumber, RegDate, Status, Authors, Description FROM copyrights WHERE emp_id = ? ORDER BY RegDate DESC',
      [empId]
    );
    return rows;
  }

  // Fetch PhDs produced (phd_produced)
  static async getPhdProduced(empId: string): Promise<any[]> {
    const [rows] = await resumeDB.query<RowDataPacket[]>(
      'SELECT ScholarName, Title, University, Category, RegYear, AwardedYear, Role, Status, Description FROM phd_produced WHERE emp_id = ? ORDER BY AwardedYear DESC, RegYear DESC',
      [empId]
    );
    return rows;
  }

  // ==========================================
  // DASHBOARD & ADMIN OPERATIONS
  // ==========================================

  // Count Dashboard Stats
  static async getDashboardCounts(): Promise<{ publications: number; foreignVisits: number; organizers: number }> {
    try {
      const [[pubRow]] = await resumeDB.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM publication');
      const [[fvRow]] = await resumeDB.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM forigenvisite');
      const [[orgRow]] = await resumeDB.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM organizer');
      return {
        publications: pubRow ? pubRow.count : 0,
        foreignVisits: fvRow ? fvRow.count : 0,
        organizers: orgRow ? orgRow.count : 0,
      };
    } catch (err) {
      return { publications: 0, foreignVisits: 0, organizers: 0 };
    }
  }

  // List all Foreign Visits with Pagination/Filter
  static async listForeignVisits(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    matchingEmpIds?: string[];
    exportAll?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    let sql = 'SELECT Id as id, emp_id, Company as company, Purpose as purpose, DFrom as dfrom, DTo as dto, Agency as agency, Invitation as invitation, Certificate as certificate FROM forigenvisite';
    let countSql = 'SELECT COUNT(*) as count FROM forigenvisite';
    const params: any[] = [];
    const countParams: any[] = [];
    const whereClauses: string[] = [];

    if (options.empId) {
      whereClauses.push('emp_id = ?');
      params.push(options.empId);
      countParams.push(options.empId);
    }

    if (options.search) {
      const searchLike = `%${options.search}%`;
      let searchClause = '(Company LIKE ? OR Purpose LIKE ? OR Agency LIKE ? OR Invitation LIKE ? OR Certificate LIKE ?';
      params.push(searchLike, searchLike, searchLike, searchLike, searchLike);
      countParams.push(searchLike, searchLike, searchLike, searchLike, searchLike);

      if (options.matchingEmpIds && options.matchingEmpIds.length > 0) {
        searchClause += ' OR emp_id IN (?)';
        params.push(options.matchingEmpIds);
        countParams.push(options.matchingEmpIds);
      }
      searchClause += ')';
      whereClauses.push(searchClause);
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += whereStr;
      countSql += whereStr;
    }

    // Get Total Count
    let total = 0;
    try {
      const [countRows] = await resumeDB.query<RowDataPacket[]>(countSql, countParams);
      total = countRows[0] ? countRows[0].count : 0;
    } catch (err) {
      total = 0;
    }

    // Apply Pagination
    if (!options.exportAll) {
      sql += ' LIMIT ? OFFSET ?';
      const offset = (options.page - 1) * options.limit;
      params.push(options.limit, offset);
    }

    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(sql, params);
      return { data: rows, total };
    } catch (err) {
      return { data: [], total: 0 };
    }
  }

  // Add Foreign Visit
  static async addForeignVisit(data: {
    emp_id: string | null;
    company: string | null;
    purpose: string | null;
    dfrom: string | null;
    dto: string | null;
    agency: string | null;
    invitation: string | null;
    certificate: string | null;
  }): Promise<number> {
    const [result] = await resumeDB.query<ResultSetHeader>(
      'INSERT INTO forigenvisite (emp_id, Company, Purpose, DFrom, DTo, Agency, Invitation, Certificate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [data.emp_id, data.company, data.purpose, data.dfrom, data.dto, data.agency, data.invitation, data.certificate]
    );
    return result.insertId;
  }

  // Update Foreign Visit
  static async updateForeignVisit(id: number, data: Partial<{
    emp_id: string | null;
    company: string | null;
    purpose: string | null;
    dfrom: string | null;
    dto: string | null;
    agency: string | null;
    invitation: string | null;
    certificate: string | null;
  }>): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    const map = {
      emp_id: 'emp_id',
      company: 'Company',
      purpose: 'Purpose',
      dfrom: 'DFrom',
      dto: 'DTo',
      agency: 'Agency',
      invitation: 'Invitation',
      certificate: 'Certificate'
    };

    Object.entries(data).forEach(([key, val]) => {
      const dbKey = map[key as keyof typeof map];
      if (dbKey) {
        updates.push(`${dbKey} = ?`);
        params.push(val !== undefined ? val : null);
      }
    });

    if (updates.length === 0) return;
    params.push(id);

    await resumeDB.query(`UPDATE forigenvisite SET ${updates.join(', ')} WHERE Id = ?`, params);
  }

  // Delete Foreign Visit
  static async deleteForeignVisit(id: number): Promise<void> {
    await resumeDB.query('DELETE FROM forigenvisite WHERE Id = ?', [id]);
  }

  // List all Organizers with Pagination/Filter
  static async listOrganizers(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    matchingEmpIds?: string[];
    exportAll?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    let sql = 'SELECT Id as id, emp_id, T_role, O_type, Title, Date_f, Date_t, Level, Role, Org, Org_Address, local, outstation, Amount, letter, Sanctioned, Utilized, uc, report, photo1, photo2, photo3, photo4 FROM organizer';
    let countSql = 'SELECT COUNT(*) as count FROM organizer';
    const params: any[] = [];
    const countParams: any[] = [];
    const whereClauses: string[] = [];

    if (options.empId) {
      whereClauses.push('emp_id = ?');
      params.push(options.empId);
      countParams.push(options.empId);
    }

    if (options.search) {
      const searchLike = `%${options.search}%`;
      let searchClause = '(Title LIKE ? OR Org LIKE ? OR Role LIKE ? OR Level LIKE ? OR O_type LIKE ?';
      params.push(searchLike, searchLike, searchLike, searchLike, searchLike);
      countParams.push(searchLike, searchLike, searchLike, searchLike, searchLike);

      if (options.matchingEmpIds && options.matchingEmpIds.length > 0) {
        searchClause += ' OR emp_id IN (?)';
        params.push(options.matchingEmpIds);
        countParams.push(options.matchingEmpIds);
      }
      searchClause += ')';
      whereClauses.push(searchClause);
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += whereStr;
      countSql += whereStr;
    }

    let total = 0;
    try {
      const [countRows] = await resumeDB.query<RowDataPacket[]>(countSql, countParams);
      total = countRows[0] ? countRows[0].count : 0;
    } catch (err) {
      total = 0;
    }

    if (!options.exportAll) {
      sql += ' LIMIT ? OFFSET ?';
      const offset = (options.page - 1) * options.limit;
      params.push(options.limit, offset);
    }

    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(sql, params);
      return { data: rows, total };
    } catch (err) {
      return { data: [], total: 0 };
    }
  }

  // Add Organizer
  static async addOrganizer(data: any): Promise<number> {
    const fields = [
      'emp_id', 'T_role', 'O_type', 'Title', 'Date_f', 'Date_t', 'Level', 'Role', 'Org', 'Org_Address', 
      'local', 'outstation', 'Amount', 'letter', 'Sanctioned', 'Utilized', 'uc', 'report', 
      'photo1', 'photo2', 'photo3', 'photo4'
    ];
    const placeholders = fields.map(() => '?').join(', ');
    const params = fields.map((f) => data[f] !== undefined ? data[f] : null);

    const [result] = await resumeDB.query<ResultSetHeader>(
      `INSERT INTO organizer (${fields.join(', ')}) VALUES (${placeholders})`,
      params
    );
    return result.insertId;
  }

  // Update Organizer
  static async updateOrganizer(id: number, data: any): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    
    const fields = [
      'emp_id', 'T_role', 'O_type', 'Title', 'Date_f', 'Date_t', 'Level', 'Role', 'Org', 'Org_Address', 
      'local', 'outstation', 'Amount', 'letter', 'Sanctioned', 'Utilized', 'uc', 'report', 
      'photo1', 'photo2', 'photo3', 'photo4'
    ];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(data[f]);
      }
    });

    if (updates.length === 0) return;
    params.push(id);

    await resumeDB.query(`UPDATE organizer SET ${updates.join(', ')} WHERE Id = ?`, params);
  }

  // Delete Organizer
  static async deleteOrganizer(id: number): Promise<void> {
    await resumeDB.query('DELETE FROM organizer WHERE Id = ?', [id]);
  }

  // List all Publications with Pagination/Filter
  static async listPublications(options: {
    page: number;
    limit: number;
    search?: string;
    empId?: string;
    matchingEmpIds?: string[];
    exportAll?: boolean;
  }): Promise<{ data: any[]; total: number }> {
    let sql = 'SELECT Id as id, emp_id, P_type, Title, P_Name, P_Level, Author_1, Author_2, Author_3, Volume, Issue, Page_from, Page_to, Impact_F, Indexing, Publisher, P_year, P_month, DOI, Webpage, Paper, UPDATED FROM publication';
    let countSql = 'SELECT COUNT(*) as count FROM publication';
    const params: any[] = [];
    const countParams: any[] = [];
    const whereClauses: string[] = [];

    if (options.empId) {
      whereClauses.push('emp_id = ?');
      params.push(options.empId);
      countParams.push(options.empId);
    }

    if (options.search) {
      const searchLike = `%${options.search}%`;
      let searchClause = '(Title LIKE ? OR P_Name LIKE ? OR Publisher LIKE ? OR Author_1 LIKE ? OR Author_2 LIKE ? OR Author_3 LIKE ?';
      params.push(searchLike, searchLike, searchLike, searchLike, searchLike, searchLike);
      countParams.push(searchLike, searchLike, searchLike, searchLike, searchLike, searchLike);

      if (options.matchingEmpIds && options.matchingEmpIds.length > 0) {
        searchClause += ' OR emp_id IN (?)';
        params.push(options.matchingEmpIds);
        countParams.push(options.matchingEmpIds);
      }
      searchClause += ')';
      whereClauses.push(searchClause);
    }

    if (whereClauses.length > 0) {
      const whereStr = ` WHERE ${whereClauses.join(' AND ')}`;
      sql += whereStr;
      countSql += whereStr;
    }

    let total = 0;
    try {
      const [countRows] = await resumeDB.query<RowDataPacket[]>(countSql, countParams);
      total = countRows[0] ? countRows[0].count : 0;
    } catch (err) {
      total = 0;
    }

    if (!options.exportAll) {
      sql += ' LIMIT ? OFFSET ?';
      const offset = (options.page - 1) * options.limit;
      params.push(options.limit, offset);
    }

    try {
      const [rows] = await resumeDB.query<RowDataPacket[]>(sql, params);
      return { data: rows, total };
    } catch (err) {
      return { data: [], total: 0 };
    }
  }

  // Add Publication
  static async addPublication(data: any): Promise<number> {
    const fields = [
      'emp_id', 'P_type', 'Title', 'P_Name', 'P_Level', 'Author_1', 'Author_2', 'Author_3', 
      'Volume', 'Issue', 'Page_from', 'Page_to', 'Impact_F', 'Indexing', 'Publisher', 
      'P_year', 'P_month', 'DOI', 'Webpage', 'Paper', 'UPDATED'
    ];
    const placeholders = fields.map(() => '?').join(', ');
    const params = fields.map((f) => data[f] !== undefined ? data[f] : null);

    const [result] = await resumeDB.query<ResultSetHeader>(
      `INSERT INTO publication (${fields.join(', ')}) VALUES (${placeholders})`,
      params
    );
    return result.insertId;
  }

  // Update Publication
  static async updatePublication(id: number, data: any): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    
    const fields = [
      'emp_id', 'P_type', 'Title', 'P_Name', 'P_Level', 'Author_1', 'Author_2', 'Author_3', 
      'Volume', 'Issue', 'Page_from', 'Page_to', 'Impact_F', 'Indexing', 'Publisher', 
      'P_year', 'P_month', 'DOI', 'Webpage', 'Paper', 'UPDATED'
    ];

    fields.forEach((f) => {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        params.push(data[f]);
      }
    });

    if (updates.length === 0) return;
    params.push(id);

    await resumeDB.query(`UPDATE publication SET ${updates.join(', ')} WHERE Id = ?`, params);
  }

  // Delete Publication
  static async deletePublication(id: number): Promise<void> {
    await resumeDB.query('DELETE FROM publication WHERE Id = ?', [id]);
  }
}
