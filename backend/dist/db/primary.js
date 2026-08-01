"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.primaryPool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("../config/env");
const logger_1 = require("../config/logger");
const connectionString = (0, env_1.getPrimaryDbConfig)();
exports.primaryPool = promise_1.default.createPool(connectionString);
// Test the connection immediately on startup
exports.primaryPool.getConnection()
    .then((connection) => {
    logger_1.logger.info('Connected to Primary MySQL database successfully.');
    connection.release();
})
    .catch((err) => {
    logger_1.logger.error('CRITICAL: Primary MySQL database connection failed!', err);
});
