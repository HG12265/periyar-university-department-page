"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacultyRepository = void 0;
const db_1 = require("../db");
class FacultyRepository {
    // Get faculties in a department
    static async getByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE dept_id = ? ORDER BY order_index ASC', [deptId]);
        return rows;
    }
    // Find faculty by ID
    static async findById(id) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE id = ? LIMIT 1', [id]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    // Find faculty by emp_id
    static async findByEmpId(empId) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, emp_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index FROM faculties WHERE emp_id = ? LIMIT 1', [empId]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    // Add a new faculty member
    static async add(deptId, name, designation, email, specialization, imageUrl, profileUrl, isFormer = 0, orderIndex = 0, empId) {
        const [result] = await db_1.primaryDB.query('INSERT INTO faculties (dept_id, name, designation, email, specialization, image_url, profile_url, is_former, order_index, emp_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
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
        ]);
        return result.insertId;
    }
    // Update an existing faculty member
    static async update(id, fields) {
        const updates = [];
        const params = [];
        Object.entries(fields).forEach(([key, val]) => {
            updates.push(`${key} = ?`);
            params.push(val !== undefined ? val : null);
        });
        if (updates.length === 0)
            return;
        params.push(id);
        await db_1.primaryDB.query(`UPDATE faculties SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    // Delete a faculty member
    static async delete(id) {
        await db_1.primaryDB.query('DELETE FROM faculties WHERE id = ?', [id]);
    }
    // Get all faculties with department names
    static async getAllWithDeptName() {
        const [rows] = await db_1.primaryDB.query('SELECT f.id, f.dept_id, f.emp_id, f.name, f.designation, f.email, f.specialization, f.image_url, f.profile_url, f.is_former, f.order_index, d.name as department_name ' +
            'FROM faculties f ' +
            'LEFT JOIN departments d ON f.dept_id = d.id');
        return rows;
    }
}
exports.FacultyRepository = FacultyRepository;
