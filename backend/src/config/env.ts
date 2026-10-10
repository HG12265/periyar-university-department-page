import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environmental variables from multiple possible locations (.env in cwd, .env in app root, .env in parent)
[
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
].forEach((envPath) => {
  try {
    dotenv.config({ path: envPath });
  } catch (e) {
    // Ignore read errors
  }
});

const envSchema = z.object({
  PORT: z.union([z.coerce.number(), z.string()]).default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Security Configurations with safe fallbacks
  SECRET_KEY: z.string().default('periyar_univ_dept_portal_secret_key_2026'),
  JWT_SECRET: z.string().default('periyar_univ_dept_portal_secure_jwt_key_2026'),
  
  // Primary DB Configurations with production fallbacks
  DB_USER: z.string().default(process.env.DB_USER || 'periyaruni_deptuser'),
  DB_PASSWORD: z.string().default(process.env.DB_PASSWORD || 'GOWtham123'),
  DB_HOST: z.string().default(process.env.DB_HOST || 'localhost'),
  DB_NAME: z.string().default(process.env.DB_NAME || 'periyaruni_deptdb'),
  DATABASE_URL: z.string().optional(),
  
  // Legacy Resume DB Configurations
  RESUME_DB_USER: z.string().optional(),
  RESUME_DB_PASSWORD: z.string().optional(),
  RESUME_DB_HOST: z.string().optional(),
  RESUME_DB_PORT: z.string().default('3306'),
  RESUME_DB_NAME: z.string().optional(),
  RESUME_DATABASE_URL: z.string().optional(),
  
  // Storage Configurations
  PDF_STORAGE_PATH: z.string().default('uploads/resumes'),
  UPLOAD_DIR: z.string().default('uploads'),
  
  // CORS & Security Allowed Origins
  ALLOWED_ORIGINS: z.preprocess((val) => {
    const raw = typeof val === 'string' && val.trim() ? val : (process.env.CORS_ORIGIN || '');
    const defaults = [
      'http://localhost:3000',
      'http://localhost:5000',
      'https://periyaruniversity.ac.in',
      'https://www.periyaruniversity.ac.in',
      'http://periyaruniversity.ac.in',
      'http://www.periyaruniversity.ac.in',
    ];
    if (!raw) return defaults.join(',');
    const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
    defaults.forEach((d) => {
      if (!list.includes(d)) list.push(d);
    });
    return list.join(',');
  }, z.string()),
  
  // Default Administrative Credentials Seeding
  ENABLE_DEFAULT_ADMIN_SEED: z.preprocess(
    (val) => String(val).toLowerCase() === 'true',
    z.boolean()
  ).default(false),
  ADMIN_USERNAME: z.string().optional(),
  ADMIN_PASSWORD: z.string().optional(),
});

// Run validation
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ CRITICAL STARTUP ERROR: Environment validation failed!');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;

// Resolve Primary DB Connection Config
export const getPrimaryDbConfig = (): any => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  return {
    host: env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    connectTimeout: 8000,
    charset: 'utf8mb4',
  };
};

// Resolve Resume DB Connection Config
export const getResumeDbConfig = (): any => {
  if (env.RESUME_DATABASE_URL) {
    return env.RESUME_DATABASE_URL;
  }
  const user = env.RESUME_DB_USER || env.DB_USER;
  const password = env.RESUME_DB_PASSWORD !== undefined ? env.RESUME_DB_PASSWORD : env.DB_PASSWORD;
  const host = env.RESUME_DB_HOST || env.DB_HOST;
  const port = Number(env.RESUME_DB_PORT || 3306);
  const dbName = env.RESUME_DB_NAME || env.DB_NAME;

  return {
    host,
    port,
    user,
    password,
    database: dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 8000,
    charset: 'utf8mb4',
  };
};

// Resolve JWT Secret Key
export const getJwtSecret = () => {
  return env.JWT_SECRET || env.SECRET_KEY;
};
