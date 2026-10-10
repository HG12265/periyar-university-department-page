import mysql from 'mysql2/promise';
import { getResumeDbConfig } from '../config/env';
import { primaryPool } from './primary';
import { logger } from '../config/logger';

const resumeConfig = getResumeDbConfig();

export const resumePool = mysql.createPool(resumeConfig);

let isResumeDbAlive = false;
let lastCheckTime = 0;
let lastErrorMessage: string | null = null;

export const checkResumeDbStatus = async (force = false): Promise<boolean> => {
  const now = Date.now();
  // Cache connection status for 30s to avoid blocking requests on unreachable remote IPs
  if (!force && now - lastCheckTime < 30000) {
    return isResumeDbAlive;
  }
  lastCheckTime = now;

  try {
    const conn = await resumePool.getConnection();
    isResumeDbAlive = true;
    lastErrorMessage = null;
    conn.release();
    return true;
  } catch (err: any) {
    isResumeDbAlive = false;
    lastErrorMessage = err?.message || String(err);
    return false;
  }
};

// Initial connection test on application boot
checkResumeDbStatus(true)
  .then((connected) => {
    if (connected) {
      logger.info('Connected to Legacy Resume MySQL database successfully.');
    } else {
      logger.warn(`Legacy Resume database unreachable (${lastErrorMessage}). Automatic seamless fallback to primary database will be used.`);
    }
  })
  .catch((e) => {
    logger.warn(`Legacy Resume startup check error: ${e.message}`);
  });

export const getResumeDbStatus = () => ({
  isAlive: isResumeDbAlive,
  lastError: lastErrorMessage,
  targetHost: typeof resumeConfig === 'object' ? resumeConfig.host : 'URL',
  targetDatabase: typeof resumeConfig === 'object' ? resumeConfig.database : 'URL',
});

// Smart DB client that routes queries to resumePool if online, or seamlessly executes on primaryPool
export const smartResumeDB = {
  async query<T = any>(sql: string, values?: any): Promise<[T, any]> {
    // 1. Try resumePool if it is currently alive
    if (isResumeDbAlive) {
      try {
        return await (resumePool.query as any)(sql, values);
      } catch (err: any) {
        logger.warn(`Resume DB query failed (${err.message}). Seamlessly falling back to primary database...`);
        isResumeDbAlive = false;
        lastErrorMessage = err?.message || String(err);
      }
    }

    // 2. Fallback execution on primaryPool
    return await (primaryPool.query as any)(sql, values);
  },

  async getConnection(): Promise<mysql.PoolConnection> {
    if (isResumeDbAlive) {
      try {
        return await resumePool.getConnection();
      } catch (err: any) {
        isResumeDbAlive = false;
        lastErrorMessage = err?.message || String(err);
      }
    }
    return await primaryPool.getConnection();
  },

  async end(): Promise<void> {
    try {
      await resumePool.end();
    } catch (e) {
      // Ignore cleanup error
    }
  },
};
