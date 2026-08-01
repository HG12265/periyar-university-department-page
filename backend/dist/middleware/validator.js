"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQuery = exports.validateBody = void 0;
const ApiError_1 = require("../utils/ApiError");
const validateBody = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            // Format validation errors to match FastAPI's RequestValidationError format
            const formattedErrors = result.error.issues.map((err) => ({
                loc: ['body', ...err.path.map(String)],
                msg: err.message,
                type: err.code,
            }));
            return next(new ApiError_1.ApiError(422, 'Request validation failed', formattedErrors));
        }
        req.body = result.data;
        next();
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.query);
        if (!result.success) {
            const formattedErrors = result.error.issues.map((err) => ({
                loc: ['query', ...err.path.map(String)],
                msg: err.message,
                type: err.code,
            }));
            return next(new ApiError_1.ApiError(422, 'Query parameter validation failed', formattedErrors));
        }
        req.query = result.data;
        next();
    };
};
exports.validateQuery = validateQuery;
