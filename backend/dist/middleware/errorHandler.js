"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError_1.ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors || undefined,
        });
    }
    // Log unexpected / system errors using Pino
    logger_1.logger.error({
        msg: 'Unhandled internal server error',
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    return res.status(500).json({
        success: false,
        message: 'An unexpected internal server error occurred.',
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
