"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityHeaders = void 0;
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const securityHeaders = (req, res, next) => {
    const requestId = (0, uuid_1.v4)();
    // Set tracking ID on request and response headers
    req.headers['x-request-id'] = requestId;
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
    // Relax security headers for static uploads so that PDFs and images can render and open correctly
    if (req.path.includes('/uploads')) {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    }
    else {
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
        res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    }
    // Content-Security-Policy in Active Enforcement Mode
    const allowedOrigins = env_1.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const hasLocalhost = allowedOrigins.some((origin) => origin.includes('localhost'));
    const localhostEndpoint = hasLocalhost ? ' http://localhost:5000' : '';
    const cspPolicy = `default-src 'self'; ` +
        `script-src 'self' 'unsafe-inline' 'unsafe-eval'; ` +
        `style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; ` +
        `img-src 'self' data: blob: https:${localhostEndpoint}; ` +
        `font-src 'self' data: https:; ` +
        `connect-src 'self' https:${localhostEndpoint}; ` +
        `frame-src 'self' https://www.youtube.com https://youtube.com; ` +
        `frame-ancestors 'none'; ` +
        `base-uri 'self'; ` +
        `form-action 'self'; ` +
        `object-src 'none';`;
    res.setHeader('Content-Security-Policy', cspPolicy);
    next();
};
exports.securityHeaders = securityHeaders;
exports.default = exports.securityHeaders;
