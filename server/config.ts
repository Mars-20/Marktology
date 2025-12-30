import { z } from 'zod';

/**
 * Environment Configuration Schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  
  // Session
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),
  
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)).default('5000'),
  
  // Application
  APP_NAME: z.string().default('Marktology OS'),
  APP_URL: z.string().url().default('http://localhost:5000'),
  
  // Cloudinary (optional for file uploads)
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  
  // Optional: Monitoring & Error Tracking
  SENTRY_DSN: z.string().url().optional(),
  
  // Optional: CORS
  ALLOWED_ORIGINS: z.string().optional(),
});

/**
 * Validate and parse environment variables
 * Throws error if validation fails
 */
function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Use this instead of process.env throughout the application
 */
export const config = validateEnv();

/**
 * Check if file upload is configured
 */
export const isFileUploadEnabled = !!(
  config.CLOUDINARY_CLOUD_NAME &&
  config.CLOUDINARY_API_KEY &&
  config.CLOUDINARY_API_SECRET
);

/**
 * Check if error tracking is configured
 */
export const isErrorTrackingEnabled = !!config.SENTRY_DSN;

/**
 * Get allowed CORS origins
 */
export const getAllowedOrigins = () => {
  if (config.ALLOWED_ORIGINS) {
    return config.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  }
  return config.NODE_ENV === 'production' 
    ? [config.APP_URL] 
    : ['http://localhost:5000', 'http://localhost:5173'];
};

console.log('✅ Environment configuration validated successfully');
console.log(`📍 Environment: ${config.NODE_ENV}`);
console.log(`🌐 App URL: ${config.APP_URL}`);
console.log(`📁 File Upload: ${isFileUploadEnabled ? 'Enabled' : 'Disabled'}`);
console.log(`🔍 Error Tracking: ${isErrorTrackingEnabled ? 'Enabled' : 'Disabled'}`);
