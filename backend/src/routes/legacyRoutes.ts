import { Router } from 'express';
import { LegacyController } from '../controllers/legacyController';
import { validateBody } from '../middleware/validator';
import { getCurrentUser, requireRole } from '../middleware/auth';
import { verifyCsrf } from '../middleware/csrf';
import { auditAction } from '../middleware/audit';
import {
  foreignVisitSchema,
  foreignVisitUpdateSchema,
  organizerSchema,
  organizerUpdateSchema,
  publicationSchema,
  publicationUpdateSchema,
} from '../validators/schemas';

const router = Router();

// Dashboard counts
router.get('/admin/dashboard-stats', getCurrentUser, requireRole('dept_admin'), LegacyController.getDashboardStats);

// Foreign Visits CRUD
router.get('/admin/foreign-visits', getCurrentUser, requireRole('dept_admin'), LegacyController.listForeignVisits);
router.post('/admin/foreign-visits', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(foreignVisitSchema), auditAction('ADD_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), LegacyController.addForeignVisit);
router.put('/admin/foreign-visits/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(foreignVisitUpdateSchema), auditAction('UPDATE_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), LegacyController.updateForeignVisit);
router.delete('/admin/foreign-visits/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_FOREIGN_VISIT', 'FOREIGN_VISIT_TABLE'), LegacyController.deleteForeignVisit);

// Organizers CRUD
router.get('/admin/organizers', getCurrentUser, requireRole('dept_admin'), LegacyController.listOrganizers);
router.post('/admin/organizers', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(organizerSchema), auditAction('ADD_ORGANIZER', 'ORGANIZER_TABLE'), LegacyController.addOrganizer);
router.put('/admin/organizers/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(organizerUpdateSchema), auditAction('UPDATE_ORGANIZER', 'ORGANIZER_TABLE'), LegacyController.updateOrganizer);
router.delete('/admin/organizers/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_ORGANIZER', 'ORGANIZER_TABLE'), LegacyController.deleteOrganizer);

// Publications CRUD
router.get('/admin/publications', getCurrentUser, requireRole('dept_admin'), LegacyController.listPublications);
router.post('/admin/publications', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(publicationSchema), auditAction('ADD_PUBLICATION', 'PUBLICATION_TABLE'), LegacyController.addPublication);
router.put('/admin/publications/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(publicationUpdateSchema), auditAction('UPDATE_PUBLICATION', 'PUBLICATION_TABLE'), LegacyController.updatePublication);
router.delete('/admin/publications/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_PUBLICATION', 'PUBLICATION_TABLE'), LegacyController.deletePublication);

export default router;
