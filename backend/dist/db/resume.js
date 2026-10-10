"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.smartResumeDB = exports.getResumeDbStatus = exports.checkResumeDbStatus = exports.resumePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
const primary_1 = require("./primary");
const logger_1 = require("../config/logger");
const resumeConfig = (0, env_1.getResumeDbConfig)();
exports.resumePool = promise_1.default.createPool(resumeConfig);
let isResumeDbAlive = false;
let lastCheckTime = 0;
let lastErrorMessage = null;
const checkResumeDbStatus = async (force = false) => {
    const now = Date.now();
    // Cache connection status for 30s to avoid blocking requests on unreachable remote IPs
    if (!force && now - lastCheckTime < 30000) {
        return isResumeDbAlive;
    }
    lastCheckTime = now;
    try {
        const conn = await exports.resumePool.getConnection();
        isResumeDbAlive = true;
        lastErrorMessage = null;
        conn.release();
        return true;
    }
    catch (err) {
        isResumeDbAlive = false;
        lastErrorMessage = err?.message || String(err);
        return false;
    }
};
exports.checkResumeDbStatus = checkResumeDbStatus;
// Initial connection test on application boot
(0, exports.checkResumeDbStatus)(true)
    .then((connected) => {
    if (connected) {
        logger_1.logger.info('Connected to Legacy Resume MySQL database successfully.');
    }
    else {
        logger_1.logger.warn(`Legacy Resume database unreachable (${lastErrorMessage}). Automatic seamless fallback to primary database will be used.`);
    }
})
    .catch((e) => {
    logger_1.logger.warn(`Legacy Resume startup check error: ${e.message}`);
});
const getResumeDbStatus = () => ({
    isAlive: isResumeDbAlive,
    lastError: lastErrorMessage,
    targetHost: typeof resumeConfig === 'object' ? resumeConfig.host : 'URL',
    targetDatabase: typeof resumeConfig === 'object' ? resumeConfig.database : 'URL',
});
exports.getResumeDbStatus = getResumeDbStatus;
// Smart DB client that routes queries to resumePool if online, or seamlessly executes on primaryPool
exports.smartResumeDB = {
    async query(sql, values) {
        // 1. Try resumePool if it is currently alive
        if (isResumeDbAlive) {
            try {
                return await exports.resumePool.query(sql, values);
            }
            catch (err) {
                logger_1.logger.warn(`Resume DB query failed (${err.message}). Seamlessly falling back to primary database...`);
                isResumeDbAlive = false;
                lastErrorMessage = err?.message || String(err);
            }
        }
        // 2. Fallback execution on primaryPool
        return await primary_1.primaryPool.query(sql, values);
    },
    async getConnection() {
        if (isResumeDbAlive) {
            try {
                return await exports.resumePool.getConnection();
            }
            catch (err) {
                isResumeDbAlive = false;
                lastErrorMessage = err?.message || String(err);
            }
        }
        return await primary_1.primaryPool.getConnection();
    },
    async end() {
        try {
            await exports.resumePool.end();
        }
        catch (e) {
            // Ignore cleanup error
        }
    },
};
