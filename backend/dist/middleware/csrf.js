"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyCsrf = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const verifyCsrf = (req, res, next) => {
    // Only verify for state-modifying HTTP methods
    if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
        // If the request is authenticated via a custom 'Authorization: Bearer <token>' header,
        // it is immune to CSRF because browsers cannot attach custom headers automatically on cross-site requests.
        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            if (token && token !== 'undefined' && token !== 'null') {
                return next();
            }
        }
        // Enforce Double Submit Cookie verification for cookie-based sessions
        const csrfCookie = req.cookies ? req.cookies['csrf_token'] : null;
        const csrfHeader = req.headers['x-csrf-token'];
        if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            logger_1.logger.warn(`SECURITY WARNING: CSRF guard blocked ${req.method} request from IP ${ip} due to missing/mismatched tokens!`);
            return next(new ApiError_1.ApiError(403, 'CSRF verification failed. Request rejected.'));
        }
    }
    next();
};
exports.verifyCsrf = verifyCsrf;
exports.default = exports.verifyCsrf;
