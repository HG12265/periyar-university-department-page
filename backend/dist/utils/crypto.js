"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = verifyPassword;
exports.getPasswordHash = getPasswordHash;
const argon2_1 = __importDefault(require("argon2"));
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../config/logger");
async function verifyPassword(plain, hashed) {
    if (hashed.startsWith('$argon2')) {
        try {
            return await argon2_1.default.verify(hashed, plain);
        }
        catch (err) {
            logger_1.logger.debug(`Argon2 verification failed: ${err.message}`);
            return false;
        }
    }
    else {
        // Legacy PBKDF2 verification fallback
        const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
        const legacyHash = crypto_1.default.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
        return legacyHash === hashed;
    }
}
async function getPasswordHash(plain) {
    return await argon2_1.default.hash(plain);
}
