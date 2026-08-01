"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestId = void 0;
const uuid_1 = require("uuid");
const requestId = (req, res, next) => {
    const reqId = (req.headers['x-request-id'] || (0, uuid_1.v4)());
    req.id = reqId;
    res.setHeader('X-Request-Id', reqId);
    next();
};
exports.requestId = requestId;
exports.default = exports.requestId;
