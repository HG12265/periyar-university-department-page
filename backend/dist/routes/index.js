"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const deptRoutes_1 = __importDefault(require("./deptRoutes"));
const facultyRoutes_1 = __importDefault(require("./facultyRoutes"));
const resumeRoutes_1 = __importDefault(require("./resumeRoutes"));
const legacyRoutes_1 = __importDefault(require("./legacyRoutes"));
const router = (0, express_1.Router)();
// Mount all modular routes under all potential cPanel subpath prefixes ('/api', '/dept/api', '/backend/api', '/backend', etc.)
const adminPrefixes = ['/api/admin', '/dept/api/admin', '/backend/api/admin', '/backend/admin', '/admin'];
const basePrefixes = ['/api', '/dept/api', '/backend/api', '/backend', '/'];
router.use(adminPrefixes, authRoutes_1.default);
router.use(basePrefixes, deptRoutes_1.default);
router.use(basePrefixes, facultyRoutes_1.default);
router.use(basePrefixes, resumeRoutes_1.default);
router.use(basePrefixes, legacyRoutes_1.default);
// Settings route to avoid frontend 404 console warnings
router.get(['/api/settings', '/dept/api/settings', '/backend/api/settings', '/backend/settings', '/settings'], (req, res) => {
    res.status(200).json({ success: true, navbarMenu: null });
});
exports.default = router;
