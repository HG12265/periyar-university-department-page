import { Router } from 'express';
import { DeptController } from '../controllers/deptController';
import { validateBody } from '../middleware/validator';
import { getCurrentUser, requireRole } from '../middleware/auth';
import { verifyCsrf } from '../middleware/csrf';
import { upload, processUploadedFile } from '../middleware/upload';
import { auditAction } from '../middleware/audit';
import {
  sectionCreateSchema,
  sectionUpdateSchema,
  navLinkCreateSchema,
  alumniTableSaveSchema,
  placementTableSaveSchema,
  facilityCreateSchema,
  facilityUpdateSchema,
  facilitiesConfigSchema,
  facilitiesTableSchema,
  activityGallerySchema,
} from '../validators/schemas';

const router = Router();

// Public routes
router.get('/departments', DeptController.getDepartments);
router.get('/departments/:slug', DeptController.getDepartmentBySlug);

// Admin Uploads
router.post('/admin/upload', getCurrentUser, requireRole('dept_admin'), verifyCsrf, upload.single('file'), auditAction('UPLOAD_ASSET', 'UPLOADS_DIRECTORY'), processUploadedFile);
router.post('/admin/alumni/upload', getCurrentUser, requireRole('dept_admin'), verifyCsrf, upload.single('file'), (req, res, next) => { req.query.folder = 'alumni'; next(); }, auditAction('UPLOAD_ALUMNI_PHOTO', 'UPLOADS_DIRECTORY'), processUploadedFile);
router.post('/admin/placement/upload', getCurrentUser, requireRole('dept_admin'), verifyCsrf, upload.single('file'), (req, res, next) => { req.query.folder = 'placement'; next(); }, auditAction('UPLOAD_PLACEMENT_PHOTO', 'UPLOADS_DIRECTORY'), processUploadedFile);
router.post('/admin/activity-gallery/upload', getCurrentUser, requireRole('dept_admin'), verifyCsrf, upload.single('file'), (req, res, next) => { req.query.folder = 'activities'; next(); }, auditAction('UPLOAD_ACTIVITY_PHOTO', 'UPLOADS_DIRECTORY'), processUploadedFile);

// Admin Department list & CRUD
router.get('/admin/list-departments', getCurrentUser, requireRole('dept_admin'), DeptController.adminListDepartments);
router.get('/admin/departments/:id', getCurrentUser, requireRole('dept_admin'), DeptController.adminGetDepartment);
router.post('/admin/departments', getCurrentUser, requireRole('super_admin'), verifyCsrf, auditAction('CREATE_DEPARTMENT', 'DEPARTMENTS_TABLE'), DeptController.createDepartment);
router.put('/admin/departments/:id', getCurrentUser, requireRole('super_admin'), verifyCsrf, auditAction('UPDATE_DEPARTMENT', 'DEPARTMENTS_TABLE'), DeptController.updateDepartment);
router.delete('/admin/departments/:id', getCurrentUser, requireRole('super_admin'), verifyCsrf, auditAction('DELETE_DEPARTMENT', 'DEPARTMENTS_TABLE'), DeptController.deleteDepartment);

// Admin Sections CRUD
router.post('/admin/sections', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(sectionCreateSchema), auditAction('ADD_SECTION', 'SECTIONS_TABLE'), DeptController.addSection);
router.put('/admin/sections/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(sectionUpdateSchema), auditAction('UPDATE_SECTION', 'SECTIONS_TABLE'), DeptController.updateSection);
router.post('/admin/remove-section/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_SECTION', 'SECTIONS_TABLE'), DeptController.deleteSection);

// Admin Nav Links CRUD
router.post('/admin/nav-links', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(navLinkCreateSchema), auditAction('ADD_NAV_LINK', 'NAV_LINKS_TABLE'), DeptController.addNavLink);
router.post('/admin/remove-link/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_NAV_LINK', 'NAV_LINKS_TABLE'), DeptController.deleteNavLink);

// Admin Alumni CRUD
router.get('/admin/alumni/:dept_id', getCurrentUser, requireRole('dept_admin'), DeptController.getAlumni);
router.post('/admin/alumni/:dept_id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(alumniTableSaveSchema), auditAction('SAVE_ALUMNI_TABLE', 'ALUMNI_TABLE'), DeptController.saveAlumni);

// Admin Placement CRUD
router.get('/admin/placement/:dept_id', getCurrentUser, requireRole('dept_admin'), DeptController.getPlacement);
router.post('/admin/placement/:dept_id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(placementTableSaveSchema), auditAction('SAVE_PLACEMENT_TABLE', 'PLACEMENT_TABLE'), DeptController.savePlacement);

// Admin Facilities CRUD
router.post('/admin/facilities', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facilityCreateSchema), auditAction('ADD_FACILITY', 'FACILITIES_TABLE'), DeptController.addFacility);
router.put('/admin/facilities/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facilityUpdateSchema), auditAction('UPDATE_FACILITY', 'FACILITIES_TABLE'), DeptController.updateFacility);
router.post('/admin/remove-facility/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_FACILITY', 'FACILITIES_TABLE'), DeptController.deleteFacility);

// Admin Facilities configuration / grid
router.post('/admin/departments/:dept_id/facilities-config', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facilitiesConfigSchema), auditAction('SAVE_FACILITIES_CONFIG', 'FACILITIES_CONFIG'), DeptController.saveFacilitiesConfig);
router.post('/admin/departments/:dept_id/facilities-table', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facilitiesTableSchema), auditAction('SAVE_FACILITIES_TABLE', 'FACILITIES_TABLE'), DeptController.saveFacilitiesTable);

// Admin Activity Gallery CRUD
router.get('/admin/activity-gallery/:dept_id', getCurrentUser, requireRole('dept_admin'), DeptController.getActivityGallery);
router.post('/admin/activity-gallery/:dept_id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(activityGallerySchema), auditAction('SAVE_ACTIVITY_GALLERY', 'ACTIVITY_GALLERY_TABLE'), DeptController.saveActivityGallery);

// Admin Scrape Museum
router.post('/admin/scrape-museum', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('SCRAPE_MUSEUM', 'MUSEUM_TABLE'), DeptController.scrapeMuseum);

export default router;
