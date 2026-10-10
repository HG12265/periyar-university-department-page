import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import hpp from 'hpp';
import path from 'path';
import { env } from './config/env';
import { logger } from './config/logger';
import { httpLogger } from './middleware/pinoLogger';
import { securityHeaders } from './middleware/securityHeaders';
import { globalRateLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import requestId from './middleware/requestId';
import apiRouter from './routes';
import { AuthService } from './services/authService';
import { ResumeService } from './services/resumeService';
import { testDbConnections, closeDbPools, primaryDB, resumeDB } from './db';

const app = express();

async function bootstrap() {
  try {
    logger.info('Initializing Node.js backend...');

    // 1. Configure Trust Proxy (crucial for rate limiter client IP detection)
    app.set('trust proxy', 1);

    // 3. Mount Global Middlewares
    app.use(requestId); // Assign unique UUID to each request
    app.use(httpLogger); // Request/Response logger
    
    // CORS Setup
    const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

    const isAllowedOrigin = (origin: string | undefined): boolean => {
      if (!origin) return true; // Allow non-browser requests (curl, server-to-server, scripts)

      // 1. Local development
      if (
        origin.startsWith('http://localhost:') ||
        origin.startsWith('https://localhost:') ||
        origin.startsWith('http://127.0.0.1:') ||
        origin.startsWith('https://127.0.0.1:')
      ) {
        return true;
      }

      // 2. Periyar University domain and all subdomains (with and without www, http and https)
      try {
        const parsed = new URL(origin);
        const host = parsed.hostname.toLowerCase();
        if (host === 'periyaruniversity.ac.in' || host.endsWith('.periyaruniversity.ac.in')) {
          return true;
        }
      } catch {
        // Invalid URL string, fall back to explicit list
      }

      // 3. Explicitly configured allowed origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        return true;
      }

      return false;
    };

    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Blocked by CORS policy for origin: ${origin}`);
          callback(null, false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-CSRF-Token',
        'Cache-Control',
        'X-Requested-With',
        'Pragma',
        'Expires',
        'Origin',
        'Accept',
        'x-request-id',
      ],
      exposedHeaders: ['Set-Cookie', 'X-CSRF-Token'],
      optionsSuccessStatus: 200,
    };

    app.use(cors(corsOptions));
    app.options('*', cors(corsOptions));

    app.use(helmet()); // Basic security headers
    app.use(securityHeaders); // Custom security policies matching Python's CSP
    app.use(compression()); // Compress text responses
    app.use(cookieParser()); // Cookie parsing support
    app.use(express.json({ limit: '10mb' })); // Parse incoming JSON request body
    app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded body
    app.use(hpp()); // Avoid HTTP Parameter Pollution attacks

    // 4. Global Rate Limiter
    app.use(globalRateLimiter);

    // 5. Serve Static Uploaded Files
    const uploadDirResolved = path.resolve(env.UPLOAD_DIR);
    app.use(['/api/uploads', '/backend/api/uploads', '/backend/uploads', '/uploads'], express.static(uploadDirResolved));
    logger.info(`Serving static upload files from: ${uploadDirResolved}`);

    // Health Check Endpoint
    app.get(['/health', '/backend/health', '/api/health', '/backend/api/health'], async (req, res) => {
      let primaryStatus = 'connected';
      let resumeStatus = 'connected';

      try {
        const conn = await primaryDB.getConnection();
        conn.release();
      } catch (err) {
        primaryStatus = 'disconnected';
      }

      try {
        const conn = await resumeDB.getConnection();
        conn.release();
      } catch (err) {
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
    app.use(apiRouter);

    // 7. Global Error Handler Middleware (must be registered last!)
    app.use(errorHandler);

    // 8. Start HTTP Server immediately so Passenger / LiteSpeed binds to the process without 503 timeout
    const port = process.env.PORT || env.PORT || 5000;
    const server = app.listen(port, () => {
      logger.info(`===================================================`);
      logger.info(`🚀 SERVER RUNNING SUCCESSFULLY IN ${env.NODE_ENV.toUpperCase()} MODE`);
      logger.info(`🔊 Listening on port: ${port}`);
      logger.info(`===================================================`);
    });

    // 9. Verify DB Connection in background (soft-fail, never crashes HTTP server)
    try {
      await testDbConnections();
      logger.info('Database connection pool verified.');
    } catch (dbErr: any) {
      logger.warn(`Initial database connection check warning: ${dbErr.message}`);
    }

    // 10. Trigger administrative seeding (soft-fail)
    try {
      await AuthService.seedDefaultAdmin();
    } catch (seedErr: any) {
      logger.warn(`Admin seed check skipped: ${seedErr.message}`);
    }

    // 11. Schedule Background Cron Jobs
    try {
      AuthService.startTokenCleanupJob();
      ResumeService.startResumeRegenCron();
    } catch (cronErr: any) {
      logger.warn(`Background cron start warning: ${cronErr.message}`);
    }

    // Graceful Shutdown Handler
    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');
      server.close(async () => {
        logger.info('HTTP server closed.');
        try {
          await closeDbPools();
          logger.info('Database pools successfully closed.');
          process.exit(0);
        } catch (dbErr) {
          logger.error(`Error closing database pools during shutdown: ${(dbErr as Error).message}`);
          process.exit(1);
        }
      });

      // Force terminate after 10s timeout
      setTimeout(() => {
        logger.warn('Forcing immediate shutdown after 10 seconds...');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    logger.error(`Bootstrap process crashed: ${(error as Error).message}`);
    process.exit(1);
  }
}

bootstrap();
export default app;
