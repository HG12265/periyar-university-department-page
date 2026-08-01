"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginRateLimiter = exports.globalRateLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
exports.globalRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // Limit each IP to 200 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logger_1.logger.warn(`SECURITY ALERT: IP ${ip} breached global rate-limiting threshold!`);
        next(new ApiError_1.ApiError(429, 'Rate limit exceeded. Please try again later.'));
    },
});
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 attempts per minute (matches Python's @limiter.limit("5/minute"))
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        logger_1.logger.warn(`SECURITY ALERT: IP ${ip} breached admin login rate-limiting threshold!`);
        next(new ApiError_1.ApiError(429, 'Rate limit exceeded. Please slow down.'));
    },
});
