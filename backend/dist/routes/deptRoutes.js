"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deptController_1 = require("../controllers/deptController");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const upload_1 = require("../middleware/upload");
const audit_1 = require("../middleware/audit");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
// Public routes
router.get('/departments', deptController_1.DeptController.getDepartments);
router.get('/departments/:slug', deptController_1.DeptController.getDepartmentBySlug);
// Admin Uploads
router.post('/admin/upload', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, upload_1.upload.single('file'), (0, audit_1.auditAction)('UPLOAD_ASSET', 'UPLOADS_DIRECTORY'), upload_1.processUploadedFile);
router.post('/admin/alumni/upload', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, upload_1.upload.single('file'), (req, res, next) => { req.query.folder = 'alumni'; next(); }, (0, audit_1.auditAction)('UPLOAD_ALUMNI_PHOTO', 'UPLOADS_DIRECTORY'), upload_1.processUploadedFile);
router.post('/admin/placement/upload', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, upload_1.upload.single('file'), (req, res, next) => { req.query.folder = 'placement'; next(); }, (0, audit_1.auditAction)('UPLOAD_PLACEMENT_PHOTO', 'UPLOADS_DIRECTORY'), upload_1.processUploadedFile);
router.post('/admin/activity-gallery/upload', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, upload_1.upload.single('file'), (req, res, next) => { req.query.folder = 'activities'; next(); }, (0, audit_1.auditAction)('UPLOAD_ACTIVITY_PHOTO', 'UPLOADS_DIRECTORY'), upload_1.processUploadedFile);
// Admin Department list & CRUD
router.get('/admin/list-departments', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), deptController_1.DeptController.adminListDepartments);
router.get('/admin/departments/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), deptController_1.DeptController.adminGetDepartment);
router.post('/admin/departments', auth_1.getCurrentUser, (0, auth_1.requireRole)('super_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('CREATE_DEPARTMENT', 'DEPARTMENTS_TABLE'), deptController_1.DeptController.createDepartment);
router.put('/admin/departments/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('super_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('UPDATE_DEPARTMENT', 'DEPARTMENTS_TABLE'), deptController_1.DeptController.updateDepartment);
router.delete('/admin/departments/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('super_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_DEPARTMENT', 'DEPARTMENTS_TABLE'), deptController_1.DeptController.deleteDepartment);
// Admin Sections CRUD
router.post('/admin/sections', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.sectionCreateSchema), (0, audit_1.auditAction)('ADD_SECTION', 'SECTIONS_TABLE'), deptController_1.DeptController.addSection);
router.put('/admin/sections/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.sectionUpdateSchema), (0, audit_1.auditAction)('UPDATE_SECTION', 'SECTIONS_TABLE'), deptController_1.DeptController.updateSection);
router.post('/admin/remove-section/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_SECTION', 'SECTIONS_TABLE'), deptController_1.DeptController.deleteSection);
// Admin Nav Links CRUD
router.post('/admin/nav-links', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.navLinkCreateSchema), (0, audit_1.auditAction)('ADD_NAV_LINK', 'NAV_LINKS_TABLE'), deptController_1.DeptController.addNavLink);
router.post('/admin/remove-link/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_NAV_LINK', 'NAV_LINKS_TABLE'), deptController_1.DeptController.deleteNavLink);
// Admin Alumni CRUD
router.get('/admin/alumni/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), deptController_1.DeptController.getAlumni);
router.post('/admin/alumni/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.alumniTableSaveSchema), (0, audit_1.auditAction)('SAVE_ALUMNI_TABLE', 'ALUMNI_TABLE'), deptController_1.DeptController.saveAlumni);
// Admin Placement CRUD
router.get('/admin/placement/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), deptController_1.DeptController.getPlacement);
router.post('/admin/placement/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.placementTableSaveSchema), (0, audit_1.auditAction)('SAVE_PLACEMENT_TABLE', 'PLACEMENT_TABLE'), deptController_1.DeptController.savePlacement);
// Admin Facilities CRUD
router.post('/admin/facilities', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.facilityCreateSchema), (0, audit_1.auditAction)('ADD_FACILITY', 'FACILITIES_TABLE'), deptController_1.DeptController.addFacility);
router.put('/admin/facilities/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.facilityUpdateSchema), (0, audit_1.auditAction)('UPDATE_FACILITY', 'FACILITIES_TABLE'), deptController_1.DeptController.updateFacility);
router.post('/admin/remove-facility/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_FACILITY', 'FACILITIES_TABLE'), deptController_1.DeptController.deleteFacility);
// Admin Facilities configuration / grid
router.post('/admin/departments/:dept_id/facilities-config', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.facilitiesConfigSchema), (0, audit_1.auditAction)('SAVE_FACILITIES_CONFIG', 'FACILITIES_CONFIG'), deptController_1.DeptController.saveFacilitiesConfig);
router.post('/admin/departments/:dept_id/facilities-table', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.facilitiesTableSchema), (0, audit_1.auditAction)('SAVE_FACILITIES_TABLE', 'FACILITIES_TABLE'), deptController_1.DeptController.saveFacilitiesTable);
// Admin Activity Gallery CRUD
router.get('/admin/activity-gallery/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), deptController_1.DeptController.getActivityGallery);
router.post('/admin/activity-gallery/:dept_id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.activityGallerySchema), (0, audit_1.auditAction)('SAVE_ACTIVITY_GALLERY', 'ACTIVITY_GALLERY_TABLE'), deptController_1.DeptController.saveActivityGallery);
// Admin Scrape Museum
router.post('/admin/scrape-museum', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('SCRAPE_MUSEUM', 'MUSEUM_TABLE'), deptController_1.DeptController.scrapeMuseum);
exports.default = router;
