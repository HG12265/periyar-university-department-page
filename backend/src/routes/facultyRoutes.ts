import { Router } from 'express';
import { FacultyController } from '../controllers/facultyController';
import { validateBody } from '../middleware/validator';
import { getCurrentUser, requireRole } from '../middleware/auth';
import { verifyCsrf } from '../middleware/csrf';
import { facultyCreateSchema, facultyUpdateSchema } from '../validators/schemas';
import { auditAction } from '../middleware/audit';

const router = Router();

router.post('/admin/faculties', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facultyCreateSchema), auditAction('ADD_FACULTY', 'FACULTIES_TABLE'), FacultyController.addFaculty);
router.put('/admin/faculties/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, validateBody(facultyUpdateSchema), auditAction('UPDATE_FACULTY', 'FACULTIES_TABLE'), FacultyController.updateFaculty);
router.post('/admin/remove-faculty/:id', getCurrentUser, requireRole('dept_admin'), verifyCsrf, auditAction('DELETE_FACULTY', 'FACULTIES_TABLE'), FacultyController.deleteFaculty);
router.get('/admin/faculties-all', getCurrentUser, requireRole('dept_admin'), FacultyController.getAllFaculties);

export default router;
