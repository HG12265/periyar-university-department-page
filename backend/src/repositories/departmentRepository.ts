import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { primaryDB } from '../db';

export interface Department {
  id: number;
  name: string;
  slug: string;
  title: string | null;
  banner_image: string | null;
  created_at: Date;
  facilities_req_title: string | null;
  facilities_req_file: string | null;
  facilities_btn_label: string | null;
  facilities_btn_url: string | null;
  facilities_table: string | null;
}

export interface Section {
  id: number;
  dept_id: number;
  section_title: string;
  category: string;
  content: string;
  order_index: number;
}

export interface NavLink {
  id: number;
  dept_id: number;
  label: string;
  url: string;
  order_index: number;
}

export interface Facility {
  id: number;
  dept_id: number;
  title: string;
  image_url: string | null;
  link_url: string | null;
  order_index: number;
}

export class DepartmentRepository {
  // Get all departments
  static async getAll(): Promise<Department[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>('SELECT * FROM departments');
    return rows as Department[];
  }

  // Find department by slug
  static async findBySlug(slug: string): Promise<Department | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT * FROM departments WHERE slug = ? LIMIT 1',
      [slug]
    );
    if (rows.length === 0) return null;
    return rows[0] as Department;
  }

  // Find department by ID
  static async findById(id: number): Promise<Department | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT * FROM departments WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Department;
  }

  // Create department (Super Admin)
  static async create(name: string, slug: string, title?: string, bannerImage?: string): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO departments (name, slug, title, banner_image) VALUES (?, ?, ?, ?)',
      [name, slug, title || null, bannerImage || null]
    );
    return result.insertId;
  }

  // Update department (Super Admin)
  static async update(id: number, name?: string, slug?: string, title?: string, bannerImage?: string): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (name !== undefined) { updates.push('name = ?'); params.push(name); }
    if (slug !== undefined) { updates.push('slug = ?'); params.push(slug); }
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (bannerImage !== undefined) { updates.push('banner_image = ?'); params.push(bannerImage); }
    
    if (updates.length === 0) return;
    
    params.push(id);
    await primaryDB.query(
      `UPDATE departments SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // Delete department (Super Admin)
  static async delete(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM departments WHERE id = ?', [id]);
  }

  // ==========================================
  // SECTIONS
  // ==========================================
  
  static async getSectionsByDept(deptId: number): Promise<Section[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, section_title, category, content, order_index FROM department_sections WHERE dept_id = ? ORDER BY order_index ASC',
      [deptId]
    );
    return rows as Section[];
  }

  static async findSectionById(id: number): Promise<Section | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, section_title, category, content, order_index FROM department_sections WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Section;
  }

  static async addSection(deptId: number, title: string, category: string, content: string, orderIndex = 0): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO department_sections (dept_id, section_title, category, content, order_index) VALUES (?, ?, ?, ?, ?)',
      [deptId, title, category, content, orderIndex]
    );
    return result.insertId;
  }

  static async updateSection(id: number, title?: string, content?: string, category?: string, orderIndex?: number): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title !== undefined) { updates.push('section_title = ?'); params.push(title); }
    if (content !== undefined) { updates.push('content = ?'); params.push(content); }
    if (category !== undefined) { updates.push('category = ?'); params.push(category); }
    if (orderIndex !== undefined) { updates.push('order_index = ?'); params.push(orderIndex); }
    
    if (updates.length === 0) return;
    
    params.push(id);
    await primaryDB.query(
      `UPDATE department_sections SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async deleteSection(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM department_sections WHERE id = ?', [id]);
  }

  // ==========================================
  // NAV LINKS
  // ==========================================

  static async getNavLinksByDept(deptId: number): Promise<NavLink[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, label, url, order_index FROM department_nav_links WHERE dept_id = ? ORDER BY order_index ASC',
      [deptId]
    );
    return rows as NavLink[];
  }

  static async addNavLink(deptId: number, label: string, url: string, orderIndex = 0): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO department_nav_links (dept_id, label, url, order_index) VALUES (?, ?, ?, ?)',
      [deptId, label, url, orderIndex]
    );
    return result.insertId;
  }

  static async deleteNavLink(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM department_nav_links WHERE id = ?', [id]);
  }

  // ==========================================
  // ALUMNI TABLES
  // ==========================================
  
  static async getAlumniByDept(deptId: number) {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT `columns`, `rows`, meeting_title, meeting_images FROM alumni_tables WHERE dept_id = ? LIMIT 1',
      [deptId]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async saveAlumni(deptId: number, columns: string, rows: string, meetingTitle: string | null, meetingImages: string | null): Promise<void> {
    await primaryDB.query(
      'INSERT INTO alumni_tables (dept_id, `columns`, `rows`, meeting_title, meeting_images) VALUES (?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE `columns` = VALUES(`columns`), `rows` = VALUES(`rows`), meeting_title = VALUES(meeting_title), meeting_images = VALUES(meeting_images)',
      [deptId, columns, rows, meetingTitle, meetingImages]
    );
  }

  // ==========================================
  // PLACEMENT TABLES
  // ==========================================

  static async getPlacementByDept(deptId: number) {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT `columns`, `rows`, meeting_title, meeting_images FROM placement_tables WHERE dept_id = ? LIMIT 1',
      [deptId]
    );
    if (rows.length === 0) return null;
    return rows[0];
  }

  static async savePlacement(deptId: number, columns: string, rows: string, meetingTitle: string | null, meetingImages: string | null): Promise<void> {
    await primaryDB.query(
      'INSERT INTO placement_tables (dept_id, `columns`, `rows`, meeting_title, meeting_images) VALUES (?, ?, ?, ?, ?) ' +
      'ON DUPLICATE KEY UPDATE `columns` = VALUES(`columns`), `rows` = VALUES(`rows`), meeting_title = VALUES(meeting_title), meeting_images = VALUES(meeting_images)',
      [deptId, columns, rows, meetingTitle, meetingImages]
    );
  }

  // ==========================================
  // FACILITIES (List-based & Page Config)
  // ==========================================

  static async getFacilitiesByDept(deptId: number): Promise<Facility[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, title, image_url, link_url, order_index FROM facilities WHERE dept_id = ? ORDER BY order_index ASC',
      [deptId]
    );
    return rows as Facility[];
  }

  static async findFacilityById(id: number): Promise<Facility | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, title, image_url, link_url, order_index FROM facilities WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Facility;
  }

  static async addFacility(deptId: number, title: string, imageUrl?: string, linkUrl?: string, orderIndex = 0): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO facilities (dept_id, title, image_url, link_url, order_index) VALUES (?, ?, ?, ?, ?)',
      [deptId, title, imageUrl || null, linkUrl || null, orderIndex]
    );
    return result.insertId;
  }

  static async updateFacility(id: number, title?: string, imageUrl?: string, linkUrl?: string, orderIndex?: number): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];
    
    if (title !== undefined) { updates.push('title = ?'); params.push(title); }
    if (imageUrl !== undefined) { updates.push('image_url = ?'); params.push(imageUrl); }
    if (linkUrl !== undefined) { updates.push('link_url = ?'); params.push(linkUrl); }
    if (orderIndex !== undefined) { updates.push('order_index = ?'); params.push(orderIndex); }
    
    if (updates.length === 0) return;
    
    params.push(id);
    await primaryDB.query(
      `UPDATE facilities SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  static async deleteFacility(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM facilities WHERE id = ?', [id]);
  }

  // Update facilities configuration on department table
  static async saveFacilitiesConfig(deptId: number, reqTitle: string | null, reqFile: string | null, btnLabel: string | null, btnUrl: string | null): Promise<void> {
    await primaryDB.query(
      'UPDATE departments SET facilities_req_title = ?, facilities_req_file = ?, facilities_btn_label = ?, facilities_btn_url = ? WHERE id = ?',
      [reqTitle, reqFile, btnLabel, btnUrl, deptId]
    );
  }

  // Update facilities grid table on department table
  static async saveFacilitiesTable(deptId: number, facilitiesTable: string): Promise<void> {
    await primaryDB.query(
      'UPDATE departments SET facilities_table = ? WHERE id = ?',
      [facilitiesTable, deptId]
    );
  }

  // ==========================================
  // ACTIVITY GALLERY
  // ==========================================

  static async getActivityGalleryByDept(deptId: number): Promise<string | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT events FROM activity_galleries WHERE dept_id = ? LIMIT 1',
      [deptId]
    );
    if (rows.length === 0) return null;
    return rows[0].events;
  }

  static async saveActivityGallery(deptId: number, events: string): Promise<void> {
    await primaryDB.query(
      'INSERT INTO activity_galleries (dept_id, events) VALUES (?, ?) ' +
      'ON DUPLICATE KEY UPDATE events = VALUES(events)',
      [deptId, events]
    );
  }
}
