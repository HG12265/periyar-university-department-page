import mysql from 'mysql2/promise';
import { getPrimaryDbConfig } from '../config/env';
import { logger } from '../config/logger';

const connectionString = getPrimaryDbConfig();

export const primaryPool = mysql.createPool(connectionString);

// Test the connection immediately on startup
primaryPool.getConnection()
  .then((connection) => {
    logger.info('Connected to Primary MySQL database successfully.');
    connection.release();
  })
  .catch((err) => {
    logger.error('CRITICAL: Primary MySQL database connection failed!', err);
  });
