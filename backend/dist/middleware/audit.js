"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditAction = void 0;
const userRepository_1 = require("../repositories/userRepository");
const logger_1 = require("../config/logger");
const auditAction = (action, resource) => {
    return (req, res, next) => {
        // Intercept res.json to capture response status
        const originalJson = res.json;
        res.json = function (body) {
            const requestId = String(req.id || 'unknown');
            const userId = req.user ? req.user.id : null;
            // Determine client IP address
            const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                req.socket.remoteAddress ||
                'unknown';
            const userAgent = req.headers['user-agent'] || 'unknown';
            const status = res.statusCode < 400 ? 'SUCCESS' : 'FAILURE';
            // Fire-and-forget log insertion to prevent slowing down request thread
            userRepository_1.UserRepository.logAudit(requestId, userId, ipAddress, userAgent, action, resource, status)
                .catch((err) => {
                logger_1.logger.error(`AUDIT LOGGING FAILURE: Failed to write audit record for action '${action}': ${err.message}`);
            });
            return originalJson.call(this, body);
        };
        next();
    };
};
exports.auditAction = auditAction;
exports.default = exports.auditAction;
