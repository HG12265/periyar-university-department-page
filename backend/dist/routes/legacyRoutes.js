"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const legacyController_1 = require("../controllers/legacyController");
const validator_1 = require("../middleware/validator");
const auth_1 = require("../middleware/auth");
const csrf_1 = require("../middleware/csrf");
const audit_1 = require("../middleware/audit");
const schemas_1 = require("../validators/schemas");
const router = (0, express_1.Router)();
// Dashboard counts
router.get('/admin/dashboard-stats', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), legacyController_1.LegacyController.getDashboardStats);
// Foreign Visits CRUD
router.get('/admin/foreign-visits', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), legacyController_1.LegacyController.listForeignVisits);
router.post('/admin/foreign-visits', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.foreignVisitSchema), (0, audit_1.auditAction)('ADD_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), legacyController_1.LegacyController.addForeignVisit);
router.put('/admin/foreign-visits/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.foreignVisitUpdateSchema), (0, audit_1.auditAction)('UPDATE_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), legacyController_1.LegacyController.updateForeignVisit);
router.delete('/admin/foreign-visits/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), legacyController_1.LegacyController.deleteForeignVisit);
// Organizers CRUD
router.get('/admin/organizers', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), legacyController_1.LegacyController.listOrganizers);
router.post('/admin/organizers', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.organizerSchema), (0, audit_1.auditAction)('ADD_ORGANIZER', 'ORGANIZER_TABLE'), legacyController_1.LegacyController.addOrganizer);
router.put('/admin/organizers/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.organizerUpdateSchema), (0, audit_1.auditAction)('UPDATE_ORGANIZER', 'ORGANIZER_TABLE'), legacyController_1.LegacyController.updateOrganizer);
router.delete('/admin/organizers/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_ORGANIZER', 'ORGANIZER_TABLE'), legacyController_1.LegacyController.deleteOrganizer);
// Publications CRUD
router.get('/admin/publications', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), legacyController_1.LegacyController.listPublications);
router.post('/admin/publications', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.publicationSchema), (0, audit_1.auditAction)('ADD_PUBLICATION', 'PUBLICATION_TABLE'), legacyController_1.LegacyController.addPublication);
router.put('/admin/publications/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, validator_1.validateBody)(schemas_1.publicationUpdateSchema), (0, audit_1.auditAction)('UPDATE_PUBLICATION', 'PUBLICATION_TABLE'), legacyController_1.LegacyController.updatePublication);
router.delete('/admin/publications/:id', auth_1.getCurrentUser, (0, auth_1.requireRole)('dept_admin'), csrf_1.verifyCsrf, (0, audit_1.auditAction)('DELETE_PUBLICATION', 'PUBLICATION_TABLE'), legacyController_1.LegacyController.deletePublication);
exports.default = router;
