"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resumePool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const connectionString = (0, env_1.getResumeDbConfig)();
exports.resumePool = promise_1.default.createPool(connectionString);
// Test the connection (Soft fail for local development/offline remote DBs)
exports.resumePool.getConnection()
    .then((connection) => {
    logger_1.logger.info('Connected to Legacy Resume MySQL database successfully.');
    connection.release();
})
    .catch((err) => {
    logger_1.logger.warn(`WARNING: Legacy Resume database connection failed at startup: ${err.message}. Retries will continue automatically when queried.`);
});
