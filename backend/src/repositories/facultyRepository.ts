import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { primaryDB } from '../db';

export interface Faculty {
  id: number;
  dept_id: number;
  emp_id: string | null;
  name: string;
  designation: string | null;
  email: string | null;
  specialization: string | null;
  image_url: string | null;
  profile_url: string | null;
  is_former: number;
  order_index: number;
  department_name?: string; // Optional join field
}

export class FacultyRepository {
  // Get faculties in a department
  static async getByDept(deptId: number): Promise<Faculty[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE dept_id = ? ORDER BY order_index ASC',
      [deptId]
    );
    return rows as Faculty[];
  }

  // Find faculty by ID
  static async findById(id: number): Promise<Faculty | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE id = ? LIMIT 1',
      [id]
    );
    if (rows.length === 0) return null;
    return rows[0] as Faculty;
  }

  // Find faculty by emp_id
  static async findByEmpId(empId: string): Promise<Faculty | null> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE emp_id = ? LIMIT 1',
      [empId]
    );
    if (rows.length === 0) return null;
    return rows[0] as Faculty;
  }

  // Add a new faculty member
  static async add(
    deptId: number,
    name: string,
    designation?: string,
    email?: string,
    specialization?: string,
    imageUrl?: string,
    profileUrl?: string,
    isFormer = 0,
    orderIndex = 0,
    empId?: string
  ): Promise<number> {
    const [result] = await primaryDB.query<ResultSetHeader>(
      'INSERT INTO faculties (dept_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index, emp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        deptId,
        name,
        designation || null,
        email || null,
        specialization || null,
        imageUrl || null,
        profileUrl || null,
        isFormer,
        orderIndex,
        empId || null,
      ]
    );
    return result.insertId;
  }

  // Update an existing faculty member
  static async update(
    id: number,
    fields: Partial<Omit<Faculty, 'id'>>
  ): Promise<void> {
    const updates: string[] = [];
    const params: any[] = [];

    Object.entries(fields).forEach(([key, val]) => {
      updates.push(`${key} = ?`);
      params.push(val !== undefined ? val : null);
    });

    if (updates.length === 0) return;

    params.push(id);
    await primaryDB.query(
      `UPDATE faculties SET ${updates.join(', ')} WHERE id = ?`,
      params
    );
  }

  // Delete a faculty member
  static async delete(id: number): Promise<void> {
    await primaryDB.query('DELETE FROM faculties WHERE id = ?', [id]);
  }

  // Get all faculties with department names
  static async getAllWithDeptName(): Promise<Faculty[]> {
    const [rows] = await primaryDB.query<RowDataPacket[]>(
      'SELECT f.id, f.dept_id, f.emp_id, f.name, f.designation, f.email, f.specialization, f.image_url, f.profile_url, f.is_former, f.order_index, d.name as department_name ' +
      'FROM faculties f ' +
      'LEFT JOIN departments d ON f.dept_id = d.id'
    );
    return rows as Faculty[];
  }
}
