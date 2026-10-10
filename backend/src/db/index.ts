import { primaryPool } from './primary';
import { resumePool, smartResumeDB, checkResumeDbStatus, getResumeDbStatus } from './resume';
import { logger } from '../config/logger';

export { primaryPool as primaryDB } from './primary';
export { smartResumeDB as resumeDB, resumePool, checkResumeDbStatus, getResumeDbStatus };

export async function testDbConnections() {
  // Test primary connection
  const conn1 = await primaryPool.getConnection();
  conn1.release();
  
  // Test resume connection
  await checkResumeDbStatus(true);
}

export async function closeDbPools() {
  await primaryPool.end();
  await smartResumeDB.end();
}
