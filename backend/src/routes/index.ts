import { Router } from 'express';
import authRoutes from './authRoutes';
import deptRoutes from './deptRoutes';
import facultyRoutes from './facultyRoutes';
import resumeRoutes from './resumeRoutes';
import legacyRoutes from './legacyRoutes';

const router = Router();

// Mount all modular routes under all potential cPanel subpath prefixes ('/api', '/dept/api', '/backend/api', '/backend', etc.)
const adminPrefixes = ['/api/admin', '/dept/api/admin', '/backend/api/admin', '/backend/admin', '/admin'];
const basePrefixes = ['/api', '/dept/api', '/backend/api', '/backend', '/'];

router.use(adminPrefixes, authRoutes);
router.use(basePrefixes, deptRoutes);
router.use(basePrefixes, facultyRoutes);
router.use(basePrefixes, resumeRoutes);
router.use(basePrefixes, legacyRoutes);

// Settings route to avoid frontend 404 console warnings
router.get(['/api/settings', '/dept/api/settings', '/backend/api/settings', '/backend/settings', '/settings'], (req, res) => {
  res.status(200).json({ success: true, navbarMenu: null });
});

export default router;
