"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtSecret = exports.getResumeDbConfig = exports.getPrimaryDbConfig = exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const zod_1 = require("zod");
// Load environmental variables from all potential file paths & working directories
dotenv_1.default.config();
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../.env') });
const envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(5000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    // Security Configurations
    SECRET_KEY: zod_1.z.string().min(8, 'SECRET_KEY must be at least 8 characters long').default('periyar_univ_dept_portal_secret_key_2026'),
    JWT_SECRET: zod_1.z.string().default('periyar_univ_dept_portal_secure_jwt_key_2026'),
    // Primary DB Configurations
    DB_USER: zod_1.z.string().default('root'),
    DB_PASSWORD: zod_1.z.string().default(''),
    DB_HOST: zod_1.z.string().default('localhost'),
    DB_NAME: zod_1.z.string().default('periyar_univ'),
    DATABASE_URL: zod_1.z.string().optional(),
    // Legacy Resume DB Configurations
    RESUME_DB_USER: zod_1.z.string().optional(),
    RESUME_DB_PASSWORD: zod_1.z.string().optional(),
    RESUME_DB_HOST: zod_1.z.string().optional(),
    RESUME_DB_PORT: zod_1.z.string().default('3306'),
    RESUME_DB_NAME: zod_1.z.string().optional(),
    RESUME_DATABASE_URL: zod_1.z.string().optional(),
    // Storage Configurations
    PDF_STORAGE_PATH: zod_1.z.string().default('uploads/resumes'),
    UPLOAD_DIR: zod_1.z.string().default('uploads'),
    // CORS & Security Allowed Origins
    ALLOWED_ORIGINS: zod_1.z.string().default('http://localhost:3000'),
    // Default Administrative Credentials Seeding
    ENABLE_DEFAULT_ADMIN_SEED: zod_1.z.preprocess((val) => String(val).toLowerCase() === 'true', zod_1.z.boolean()).default(false),
    ADMIN_USERNAME: zod_1.z.string().optional(),
    ADMIN_PASSWORD: zod_1.z.string().optional(),
});
// Run validation
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ CRITICAL STARTUP ERROR: Environment validation failed!');
    console.error(JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsed.data;
// Resolve Primary DB Connection Config
const getPrimaryDbConfig = () => {
    if (exports.env.DATABASE_URL) {
        return exports.env.DATABASE_URL;
    }
    const encodedPassword = encodeURIComponent(exports.env.DB_PASSWORD);
    return `mysql://${exports.env.DB_USER}:${encodedPassword}@${exports.env.DB_HOST}/${exports.env.DB_NAME}?charset=utf8mb4`;
};
exports.getPrimaryDbConfig = getPrimaryDbConfig;
// Resolve Resume DB Connection Config
const getResumeDbConfig = () => {
    if (exports.env.RESUME_DATABASE_URL) {
        return exports.env.RESUME_DATABASE_URL;
    }
    const user = exports.env.RESUME_DB_USER || exports.env.DB_USER;
    const password = exports.env.RESUME_DB_PASSWORD !== undefined ? exports.env.RESUME_DB_PASSWORD : exports.env.DB_PASSWORD;
    const host = exports.env.RESUME_DB_HOST || exports.env.DB_HOST;
    const port = exports.env.RESUME_DB_PORT;
    const dbName = exports.env.RESUME_DB_NAME || exports.env.DB_NAME;
    const encodedPassword = encodeURIComponent(password);
    return `mysql://${user}:${encodedPassword}@${host}:${port}/${dbName}?charset=utf8mb4`;
};
exports.getResumeDbConfig = getResumeDbConfig;
// Resolve JWT Secret Key
const getJwtSecret = () => {
    return exports.env.JWT_SECRET || exports.env.SECRET_KEY;
};
exports.getJwtSecret = getJwtSecret;
