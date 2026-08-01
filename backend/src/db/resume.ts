import mysql from 'mysql2/promise';
import { getResumeDbConfig } from '../config/env';
import { logger } from '../config/logger';

const connectionString = getResumeDbConfig();

export const resumePool = mysql.createPool(connectionString);

// Test the connection (Soft fail for local development/offline remote DBs)
resumePool.getConnection()
  .then((connection) => {
    logger.info('Connected to Legacy Resume MySQL database successfully.');
    connection.release();
  })
  .catch((err) => {
    logger.warn(`WARNING: Legacy Resume database connection failed at startup: ${err.message}. Retries will continue automatically when queried.`);
  });
