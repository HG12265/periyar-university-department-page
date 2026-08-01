"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepartmentRepository = void 0;
const db_1 = require("../db");
class DepartmentRepository {
    // Get all departments
    static async getAll() {
        const [rows] = await db_1.primaryDB.query('SELECT * FROM departments');
        return rows;
    }
    // Find department by slug
    static async findBySlug(slug) {
        const [rows] = await db_1.primaryDB.query('SELECT * FROM departments WHERE slug = ? LIMIT 1', [slug]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    // Find department by ID
    static async findById(id) {
        const [rows] = await db_1.primaryDB.query('SELECT * FROM departments WHERE id = ? LIMIT 1', [id]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    // Create department (Super Admin)
    static async create(name, slug, title, bannerImage) {
        const [result] = await db_1.primaryDB.query('INSERT INTO departments (name, slug, title, banner_image) VALUES (?, ?, ?, ?)', [name, slug, title || null, bannerImage || null]);
        return result.insertId;
    }
    // Update department (Super Admin)
    static async update(id, name, slug, title, bannerImage) {
        const updates = [];
        const params = [];
        if (name !== undefined) {
            updates.push('name = ?');
            params.push(name);
        }
        if (slug !== undefined) {
            updates.push('slug = ?');
            params.push(slug);
        }
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (bannerImage !== undefined) {
            updates.push('banner_image = ?');
            params.push(bannerImage);
        }
        if (updates.length === 0)
            return;
        params.push(id);
        await db_1.primaryDB.query(`UPDATE departments SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    // Delete department (Super Admin)
    static async delete(id) {
        await db_1.primaryDB.query('DELETE FROM departments WHERE id = ?', [id]);
    }
    // ==========================================
    // SECTIONS
    // ==========================================
    static async getSectionsByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, section_title, category, content, order_index FROM department_sections WHERE dept_id = ? ORDER BY order_index ASC', [deptId]);
        return rows;
    }
    static async findSectionById(id) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, section_title, category, content, order_index FROM department_sections WHERE id = ? LIMIT 1', [id]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    static async addSection(deptId, title, category, content, orderIndex = 0) {
        const [result] = await db_1.primaryDB.query('INSERT INTO department_sections (dept_id, section_title, category, content, order_index) VALUES (?, ?, ?, ?, ?)', [deptId, title, category, content, orderIndex]);
        return result.insertId;
    }
    static async updateSection(id, title, content, category, orderIndex) {
        const updates = [];
        const params = [];
        if (title !== undefined) {
            updates.push('section_title = ?');
            params.push(title);
        }
        if (content !== undefined) {
            updates.push('content = ?');
            params.push(content);
        }
        if (category !== undefined) {
            updates.push('category = ?');
            params.push(category);
        }
        if (orderIndex !== undefined) {
            updates.push('order_index = ?');
            params.push(orderIndex);
        }
        if (updates.length === 0)
            return;
        params.push(id);
        await db_1.primaryDB.query(`UPDATE department_sections SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    static async deleteSection(id) {
        await db_1.primaryDB.query('DELETE FROM department_sections WHERE id = ?', [id]);
    }
    // ==========================================
    // NAV LINKS
    // ==========================================
    static async getNavLinksByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, label, url, order_index FROM department_nav_links WHERE dept_id = ? ORDER BY order_index ASC', [deptId]);
        return rows;
    }
    static async addNavLink(deptId, label, url, orderIndex = 0) {
        const [result] = await db_1.primaryDB.query('INSERT INTO department_nav_links (dept_id, label, url, order_index) VALUES (?, ?, ?, ?)', [deptId, label, url, orderIndex]);
        return result.insertId;
    }
    static async deleteNavLink(id) {
        await db_1.primaryDB.query('DELETE FROM department_nav_links WHERE id = ?', [id]);
    }
    // ==========================================
    // ALUMNI TABLES
    // ==========================================
    static async getAlumniByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT `columns`, `rows`, meeting_title, meeting_images FROM alumni_tables WHERE dept_id = ? LIMIT 1', [deptId]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    static async saveAlumni(deptId, columns, rows, meetingTitle, meetingImages) {
        await db_1.primaryDB.query('INSERT INTO alumni_tables (dept_id, `columns`, `rows`, meeting_title, meeting_images) VALUES (?, ?, ?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE `columns` = VALUES(`columns`), `rows` = VALUES(`rows`), meeting_title = VALUES(meeting_title), meeting_images = VALUES(meeting_images)', [deptId, columns, rows, meetingTitle, meetingImages]);
    }
    // ==========================================
    // PLACEMENT TABLES
    // ==========================================
    static async getPlacementByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT `columns`, `rows`, meeting_title, meeting_images FROM placement_tables WHERE dept_id = ? LIMIT 1', [deptId]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    static async savePlacement(deptId, columns, rows, meetingTitle, meetingImages) {
        await db_1.primaryDB.query('INSERT INTO placement_tables (dept_id, `columns`, `rows`, meeting_title, meeting_images) VALUES (?, ?, ?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE `columns` = VALUES(`columns`), `rows` = VALUES(`rows`), meeting_title = VALUES(meeting_title), meeting_images = VALUES(meeting_images)', [deptId, columns, rows, meetingTitle, meetingImages]);
    }
    // ==========================================
    // FACILITIES (List-based & Page Config)
    // ==========================================
    static async getFacilitiesByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, title, image_url, link_url, order_index FROM facilities WHERE dept_id = ? ORDER BY order_index ASC', [deptId]);
        return rows;
    }
    static async findFacilityById(id) {
        const [rows] = await db_1.primaryDB.query('SELECT id, dept_id, title, image_url, link_url, order_index FROM facilities WHERE id = ? LIMIT 1', [id]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
    static async addFacility(deptId, title, imageUrl, linkUrl, orderIndex = 0) {
        const [result] = await db_1.primaryDB.query('INSERT INTO facilities (dept_id, title, image_url, link_url, order_index) VALUES (?, ?, ?, ?, ?)', [deptId, title, imageUrl || null, linkUrl || null, orderIndex]);
        return result.insertId;
    }
    static async updateFacility(id, title, imageUrl, linkUrl, orderIndex) {
        const updates = [];
        const params = [];
        if (title !== undefined) {
            updates.push('title = ?');
            params.push(title);
        }
        if (imageUrl !== undefined) {
            updates.push('image_url = ?');
            params.push(imageUrl);
        }
        if (linkUrl !== undefined) {
            updates.push('link_url = ?');
            params.push(linkUrl);
        }
        if (orderIndex !== undefined) {
            updates.push('order_index = ?');
            params.push(orderIndex);
        }
        if (updates.length === 0)
            return;
        params.push(id);
        await db_1.primaryDB.query(`UPDATE facilities SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    static async deleteFacility(id) {
        await db_1.primaryDB.query('DELETE FROM facilities WHERE id = ?', [id]);
    }
    // Update facilities configuration on department table
    static async saveFacilitiesConfig(deptId, reqTitle, reqFile, btnLabel, btnUrl) {
        await db_1.primaryDB.query('UPDATE departments SET facilities_req_title = ?, facilities_req_file = ?, facilities_btn_label = ?, facilities_btn_url = ? WHERE id = ?', [reqTitle, reqFile, btnLabel, btnUrl, deptId]);
    }
    // Update facilities grid table on department table
    static async saveFacilitiesTable(deptId, facilitiesTable) {
        await db_1.primaryDB.query('UPDATE departments SET facilities_table = ? WHERE id = ?', [facilitiesTable, deptId]);
    }
    // ==========================================
    // ACTIVITY GALLERY
    // ==========================================
    static async getActivityGalleryByDept(deptId) {
        const [rows] = await db_1.primaryDB.query('SELECT events FROM activity_galleries WHERE dept_id = ? LIMIT 1', [deptId]);
        if (rows.length === 0)
            return null;
        return rows[0].events;
    }
    static async saveActivityGallery(deptId, events) {
        await db_1.primaryDB.query('INSERT INTO activity_galleries (dept_id, events) VALUES (?, ?) ' +
            'ON DUPLICATE KEY UPDATE events = VALUES(events)', [deptId, events]);
    }
}
exports.DepartmentRepository = DepartmentRepository;
