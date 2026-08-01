import { primaryPool } from './primary';
import { resumePool } from './resume';
import { logger } from '../config/logger';

export { primaryPool as primaryDB } from './primary';
export { resumePool as resumeDB } from './resume';

export async function testDbConnections() {
  // Test primary connection
  const conn1 = await primaryPool.getConnection();
  conn1.release();
  
  // Test resume connection if configured and doesn't soft-fail
  try {
    const conn2 = await resumePool.getConnection();
    conn2.release();
  } catch (err: any) {
    logger.warn(`Soft fail on legacy database connection: ${err.message}`);
  }
}

export async function closeDbPools() {
  await primaryPool.end();
  await resumePool.end();
}
