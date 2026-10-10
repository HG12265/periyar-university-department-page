"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = verifyPassword;
exports.getPasswordHash = getPasswordHash;
const crypto_1 = __importDefault(require("crypto"));
const logger_1 = require("../config/logger");
let argon2Module = null;
try {
    argon2Module = require('argon2');
}
catch (e) {
    logger_1.logger.warn(`Native argon2 module could not be loaded, using PBKDF2 fallback: ${e.message}`);
}
async function verifyPassword(plain, hashed) {
    if (hashed.startsWith('$argon2') && argon2Module) {
        try {
            return await argon2Module.verify(hashed, plain);
        }
        catch (err) {
            logger_1.logger.debug(`Argon2 verification failed: ${err.message}`);
            return false;
        }
    }
    else {
        // Standard PBKDF2 verification fallback
        const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
        const legacyHash = crypto_1.default.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
        return legacyHash === hashed;
    }
}
async function getPasswordHash(plain) {
    if (argon2Module) {
        try {
            return await argon2Module.hash(plain);
        }
        catch (err) {
            // fallback
        }
    }
    const salt = Buffer.from('PU_DEPT_PORTAL_SALT_VALUE_2026', 'utf-8');
    return crypto_1.default.pbkdf2Sync(plain, salt, 100000, 32, 'sha256').toString('hex');
}
