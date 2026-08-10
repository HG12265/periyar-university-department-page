import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environmental variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Security Configurations
  SECRET_KEY: z.string().min(8, 'SECRET_KEY must be at least 8 characters long'),
  JWT_SECRET: z.string().optional(),
  
  // Primary DB Configurations
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default(process.env.DB_PASS || ''),
  DB_HOST: z.string().default('localhost'),
  DB_NAME: z.string().default('periyar_univ'),
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
  ALLOWED_ORIGINS: z.string().default('http://localhost:3000'),
  
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
export const getPrimaryDbConfig = () => {
  if (env.DATABASE_URL) {
    return env.DATABASE_URL;
  }
  const encodedPassword = encodeURIComponent(env.DB_PASSWORD);
  return `mysql://${env.DB_USER}:${encodedPassword}@${env.DB_HOST}/${env.DB_NAME}?charset=utf8mb4`;
};

// Resolve Resume DB Connection Config
export const getResumeDbConfig = () => {
  if (env.RESUME_DATABASE_URL) {
    return env.RESUME_DATABASE_URL;
  }
  const user = env.RESUME_DB_USER || env.DB_USER;
  const password = env.RESUME_DB_PASSWORD !== undefined ? env.RESUME_DB_PASSWORD : env.DB_PASSWORD;
  const host = env.RESUME_DB_HOST || env.DB_HOST;
  const port = env.RESUME_DB_PORT;
  const dbName = env.RESUME_DB_NAME || env.DB_NAME;
  
  const encodedPassword = encodeURIComponent(password);
  return `mysql://${user}:${encodedPassword}@${host}:${port}/${dbName}?charset=utf8mb4`;
};

// Resolve JWT Secret Key
export const getJwtSecret = () => {
  return env.JWT_SECRET || env.SECRET_KEY;
};
