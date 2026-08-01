"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const pino_http_1 = __importDefault(require("pino-http"));
const pino_1 = require("pino");
const logger_1 = require("../config/logger");
exports.httpLogger = (0, pino_http_1.default)({
    logger: logger_1.logger,
    genReqId: (req) => req.id,
    // Select appropriate log levels based on HTTP status codes
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500 || err)
            return 'error';
        if (res.statusCode >= 400)
            return 'warn';
        return 'info';
    },
    // Custom serializers to keep logs clean and GDPR-compliant
    serializers: {
        req: (req) => ({
            method: req.method,
            url: req.url,
            query: req.query,
            ip: (req.headers && req.headers['x-forwarded-for']) || (req.socket && req.socket.remoteAddress) || '',
        }),
        res: (res) => ({
            statusCode: res.statusCode,
        }),
        err: pino_1.stdSerializers.err,
    },
});
exports.default = exports.httpLogger;
