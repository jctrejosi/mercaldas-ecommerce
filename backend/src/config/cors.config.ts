import { registerAs } from '@nestjs/config';
import { CorsConfig } from './types';

export default registerAs('cors', (): CorsConfig => ({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [],
  credentials: process.env.CORS_CREDENTIALS === 'true' || false,
  methods: process.env.CORS_METHODS
    ? process.env.CORS_METHODS.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: process.env.CORS_ALLOWED_HEADERS
    ? process.env.CORS_ALLOWED_HEADERS.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: process.env.CORS_EXPOSED_HEADERS
    ? process.env.CORS_EXPOSED_HEADERS.split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : ['Content-Range', 'X-Content-Range'],
  maxAge: parseInt(process.env.CORS_MAX_AGE ?? '86400', 10),
  preflightContinue: process.env.CORS_PREFLIGHT_CONTINUE === 'true' || false,
  optionsSuccessStatus: parseInt(
    process.env.CORS_OPTIONS_SUCCESS_STATUS ?? '204',
    10,
  ),
}));
