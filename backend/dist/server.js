"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const hpp_1 = __importDefault(require("hpp"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const logger_1 = require("./config/logger");
const pinoLogger_1 = require("./middleware/pinoLogger");
const securityHeaders_1 = require("./middleware/securityHeaders");
const rateLimiter_1 = require("./middleware/rateLimiter");
const errorHandler_1 = require("./middleware/errorHandler");
const requestId_1 = __importDefault(require("./middleware/requestId"));
const routes_1 = __importDefault(require("./routes"));
const authService_1 = require("./services/authService");
const resumeService_1 = require("./services/resumeService");
const db_1 = require("./db");
const app = (0, express_1.default)();
async function bootstrap() {
    try {
        logger_1.logger.info('Initializing Node.js backend...');
        // 1. Test database connections first
        await (0, db_1.testDbConnections)();
        // 2. Configure Trust Proxy (crucial for rate limiter client IP detection)
        app.set('trust proxy', 1);
        // 3. Mount Global Middlewares
        app.use(requestId_1.default); // Assign unique UUID to each request
        app.use(pinoLogger_1.httpLogger); // Request/Response logger
        // CORS Setup
        const allowedOrigins = env_1.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
        app.use((0, cors_1.default)({
            origin: (origin, callback) => {
                // Allow requests with no origin (like mobile apps, curl, or local scripts)
                if (!origin)
                    return callback(null, true);
                if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
                    callback(null, true);
                }
                else {
                    callback(new Error('Blocked by CORS policy'));
                }
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Cache-Control', 'X-Requested-With', 'Pragma', 'Expires'],
        }));
        app.use((0, helmet_1.default)()); // Basic security headers
        app.use(securityHeaders_1.securityHeaders); // Custom security policies matching Python's CSP
        app.use((0, compression_1.default)()); // Compress text responses
        app.use((0, cookie_parser_1.default)()); // Cookie parsing support
        app.use(express_1.default.json({ limit: '10mb' })); // Parse incoming JSON request body
        app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded body
        app.use((0, hpp_1.default)()); // Avoid HTTP Parameter Pollution attacks
        // 4. Global Rate Limiter
        app.use(rateLimiter_1.globalRateLimiter);
        // 5. Serve Static Uploaded Files
        const uploadDirResolved = path_1.default.resolve(env_1.env.UPLOAD_DIR);
        app.use(['/api/uploads', '/backend/api/uploads', '/backend/uploads', '/uploads'], express_1.default.static(uploadDirResolved));
        logger_1.logger.info(`Serving static upload files from: ${uploadDirResolved}`);
        // Health Check Endpoint
        app.get(['/health', '/backend/health', '/api/health', '/backend/api/health'], async (req, res) => {
            let primaryStatus = 'connected';
            let resumeStatus = 'connected';
            try {
                const conn = await db_1.primaryDB.getConnection();
                conn.release();
            }
            catch (err) {
                primaryStatus = 'disconnected';
            }
            try {
                const conn = await db_1.resumeDB.getConnection();
                conn.release();
            }
            catch (err) {
                resumeStatus = 'disconnected';
            }
            const allOk = primaryStatus === 'connected';
            res.status(allOk ? 200 : 503).json({
                status: allOk ? 'ok' : 'error',
                database: primaryStatus,
                resumeDB: resumeStatus,
                uptime: Math.floor(process.uptime()),
                version: '1.0.0',
                timestamp: new Date().toISOString(),
            });
        });
        // 6. Register API Routes Prefix
        app.use(routes_1.default);
        // 7. Global Error Handler Middleware (must be registered last!)
        app.use(errorHandler_1.errorHandler);
        // 8. Trigger administrative seeding
        await authService_1.AuthService.seedDefaultAdmin();
        // 9. Schedule Background Cron Jobs
        authService_1.AuthService.startTokenCleanupJob();
        resumeService_1.ResumeService.startResumeRegenCron();
        // 10. Start Server
        const port = env_1.env.PORT;
        const server = app.listen(port, () => {
            logger_1.logger.info(`===================================================`);
            logger_1.logger.info(`🚀 SERVER RUNNING SUCCESSFULLY IN ${env_1.env.NODE_ENV.toUpperCase()} MODE`);
            logger_1.logger.info(`🔊 Listening on http://localhost:${port}`);
            logger_1.logger.info(`===================================================`);
        });
        // Graceful Shutdown Handler
        const shutdown = async () => {
            logger_1.logger.info('Shutting down server gracefully...');
            server.close(async () => {
                logger_1.logger.info('HTTP server closed.');
                try {
                    await (0, db_1.closeDbPools)();
                    logger_1.logger.info('Database pools successfully closed.');
                    process.exit(0);
                }
                catch (dbErr) {
                    logger_1.logger.error(`Error closing database pools during shutdown: ${dbErr.message}`);
                    process.exit(1);
                }
            });
            // Force terminate after 10s timeout
            setTimeout(() => {
                logger_1.logger.warn('Forcing immediate shutdown after 10 seconds...');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
    catch (error) {
        logger_1.logger.error(`Bootstrap process crashed: ${error.message}`);
        process.exit(1);
    }
}
bootstrap();
exports.default = app;
