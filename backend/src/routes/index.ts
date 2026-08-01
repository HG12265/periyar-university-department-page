import { Router } from 'express';
import authRoutes from './authRoutes';
import deptRoutes from './deptRoutes';
import facultyRoutes from './facultyRoutes';
import resumeRoutes from './resumeRoutes';
import legacyRoutes from './legacyRoutes';

const router = Router();

// Mount all modular routes under '/api' and '/backend/api' prefixes
router.use(['/api/admin', '/backend/api/admin', '/backend/admin'], authRoutes);
router.use(['/api', '/backend/api', '/backend'], deptRoutes);
router.use(['/api', '/backend/api', '/backend'], facultyRoutes);
router.use(['/api', '/backend/api', '/backend'], resumeRoutes);
router.use(['/api', '/backend/api', '/backend'], legacyRoutes);

// Settings route to avoid frontend 404 console warnings
router.get(['/api/settings', '/backend/api/settings', '/backend/settings'], (req, res) => {
  res.status(200).json({ success: true, navbarMenu: null });
});

export default router;
