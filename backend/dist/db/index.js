"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumeDB = exports.primaryDB = void 0;
exports.testDbConnections = testDbConnections;
exports.closeDbPools = closeDbPools;
const primary_1 = require("./primary");
const resume_1 = require("./resume");
const logger_1 = require("../config/logger");
var primary_2 = require("./primary");
Object.defineProperty(exports, "primaryDB", { enumerable: true, get: function () { return primary_2.primaryPool; } });
var resume_2 = require("./resume");
Object.defineProperty(exports, "resumeDB", { enumerable: true, get: function () { return resume_2.resumePool; } });
async function testDbConnections() {
    // Test primary connection
    const conn1 = await primary_1.primaryPool.getConnection();
    conn1.release();
    // Test resume connection if configured and doesn't soft-fail
    try {
        const conn2 = await resume_1.resumePool.getConnection();
        conn2.release();
    }
    catch (err) {
        logger_1.logger.warn(`Soft fail on legacy database connection: ${err.message}`);
    }
}
async function closeDbPools() {
    await primary_1.primaryPool.end();
    await resume_1.resumePool.end();
}
