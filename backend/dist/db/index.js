"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResumeDbStatus = exports.checkResumeDbStatus = exports.resumePool = exports.resumeDB = exports.primaryDB = void 0;
exports.testDbConnections = testDbConnections;
exports.closeDbPools = closeDbPools;
const primary_1 = require("./primary");
const resume_1 = require("./resume");
Object.defineProperty(exports, "resumePool", { enumerable: true, get: function () { return resume_1.resumePool; } });
Object.defineProperty(exports, "resumeDB", { enumerable: true, get: function () { return resume_1.smartResumeDB; } });
Object.defineProperty(exports, "checkResumeDbStatus", { enumerable: true, get: function () { return resume_1.checkResumeDbStatus; } });
Object.defineProperty(exports, "getResumeDbStatus", { enumerable: true, get: function () { return resume_1.getResumeDbStatus; } });
var primary_2 = require("./primary");
Object.defineProperty(exports, "primaryDB", { enumerable: true, get: function () { return primary_2.primaryPool; } });
async function testDbConnections() {
    // Test primary connection
    const conn1 = await primary_1.primaryPool.getConnection();
    conn1.release();
    // Test resume connection
    await (0, resume_1.checkResumeDbStatus)(true);
}
async function closeDbPools() {
    await primary_1.primaryPool.end();
    await resume_1.smartResumeDB.end();
}
