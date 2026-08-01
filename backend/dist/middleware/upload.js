"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processUploadedFile = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const ApiError_1 = require("../utils/ApiError");
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
// 1. Storage in Memory to inspect buffer bytes before committing to disk
const storage = multer_1.default.memoryStorage();
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Strict 10MB limit
    },
});
// Magic Byte Signatures Map
const MAGIC_SIGNATURES = {
    '.pdf': [Buffer.from([0x25, 0x50, 0x44, 0x46])], // %PDF
    '.png': [Buffer.from([0x89, 0x50, 0x4e, 0x47])], // \x89PNG
    '.jpg': [Buffer.from([0xff, 0xd8, 0xff])], // JPEG marker
    '.jpeg': [Buffer.from([0xff, 0xd8, 0xff])],
    '.docx': [Buffer.from([0x50, 0x4b, 0x03, 0x04])], // PK\x03\x04 (ZIP container)
    '.doc': [
        Buffer.from([0xd0, 0xcf, 0x11, 0xe0]), // OLE legacy doc
        Buffer.from([0x50, 0x4b, 0x03, 0x04]),
    ],
};
const ALLOWED_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx']);
const processUploadedFile = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ApiError_1.ApiError(400, 'No file was uploaded.');
        }
        const { buffer, originalname } = req.file;
        const ext = path_1.default.extname(originalname).toLowerCase();
        // 1. Verify Allowed Extension Whitelist
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            throw new ApiError_1.ApiError(400, `File extension ${ext} is not permitted. Only PDF, images, and DOCX documents are allowed.`);
        }
        // 2. Magic Bytes Validation
        const expectedSigs = MAGIC_SIGNATURES[ext] || [];
        let matched = false;
        for (const sig of expectedSigs) {
            const headerChunk = buffer.subarray(0, sig.length);
            if (headerChunk.equals(sig)) {
                matched = true;
                break;
            }
        }
        if (!matched) {
            logger_1.logger.warn(`SECURITY ALERT: Malicious file upload attempt! Extension was reported as '${ext}' but magic bytes did not match.`);
            throw new ApiError_1.ApiError(400, 'Malicious upload attempt: File signature/magic bytes mismatch with reported file extension.');
        }
        // 3. Resolve secure folder target
        const folderInput = (req.body.folder || req.query.folder || 'syllabus');
        const folderLower = folderInput.toLowerCase();
        let safeFolder = 'syllabus';
        if (folderLower.includes('syllabus') || folderLower.includes('curriculum') || folderLower.includes('aicte') || folderLower.includes('affidavit')) {
            safeFolder = 'syllabus';
        }
        else if (folderLower.includes('faculty') || folderLower.includes('faculties') || folderLower.includes('prof')) {
            safeFolder = 'faculties';
        }
        else if (folderLower.includes('alumni')) {
            safeFolder = 'alumni';
        }
        else if (folderLower.includes('facility') || folderLower.includes('facilities') || folderLower.includes('museum') || folderLower.includes('energy') || folderLower.includes('park')) {
            safeFolder = 'facilities';
        }
        else if (folderLower.includes('placement')) {
            safeFolder = 'placement';
        }
        else if (folderLower.includes('banner')) {
            safeFolder = 'banner';
        }
        else if (folderLower.includes('activity') || folderLower.includes('activities') || folderLower.includes('project') || folderLower.includes('gallery')) {
            safeFolder = 'activities';
        }
        // 4. Generate Secure UUID filename to prevent directory traversal and overwrites
        const secureFilename = `${(0, uuid_1.v4)().replace(/-/g, '')}${ext}`;
        const targetDir = path_1.default.resolve(env_1.env.UPLOAD_DIR, safeFolder);
        const targetPath = path_1.default.join(targetDir, secureFilename);
        // Ensure directory exists
        if (!fs_1.default.existsSync(targetDir)) {
            fs_1.default.mkdirSync(targetDir, { recursive: true });
        }
        // 5. Write buffer to secure file location on disk
        await fs_1.default.promises.writeFile(targetPath, buffer);
        // 6. Return response URL (raw data for frontend compatibility)
        const fileUrl = `/api/uploads/${safeFolder}/${secureFilename}`;
        return res.status(200).json({ url: fileUrl });
    }
    catch (error) {
        next(error);
    }
};
exports.processUploadedFile = processUploadedFile;
