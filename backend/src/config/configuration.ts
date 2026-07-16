import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
  refreshExpiresIn: string;
}

export interface CorsConfig {
  origin: string[] | boolean | string;
  credentials: boolean;
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export type CrossOriginResourcePolicy =
  'cross-origin' | 'same-origin' | 'same-site';
export type CrossOriginOpenerPolicy =
  'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
export type ReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'origin'
  | 'origin-when-cross-origin'
  | 'same-origin'
  | 'strict-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

export interface HelmetConfig {
  crossOriginResourcePolicy: { policy: CrossOriginResourcePolicy };
  crossOriginOpenerPolicy: { policy: CrossOriginOpenerPolicy };
  crossOriginEmbedderPolicy: boolean;
  referrerPolicy?: { policy: ReferrerPolicy };
}

export interface MicrosoftConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: DatabaseConfig;
  jwt: JwtConfig;
  cors: CorsConfig;
  helmet: HelmetConfig;
  microsoft: MicrosoftConfig;
  cloudinary: CloudinaryConfig;
}

export default registerAs('app', (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ??
      (() => {
        throw new Error('JWT_SECRET is required');
      })(),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN ?? '30d',
  },
  cors: {
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
  },
  helmet: {
    crossOriginResourcePolicy: {
      policy:
        (process.env
          .HELMET_CROSS_ORIGIN_RESOURCE_POLICY as CrossOriginResourcePolicy) ||
        'cross-origin',
    },
    crossOriginOpenerPolicy: {
      policy:
        (process.env
          .HELMET_CROSS_ORIGIN_OPENER_POLICY as CrossOriginOpenerPolicy) ||
        'unsafe-none',
    },
    crossOriginEmbedderPolicy:
      process.env.HELMET_CROSS_ORIGIN_EMBEDDER_POLICY === 'true' || false,
    referrerPolicy: process.env.HELMET_REFERRER_POLICY
      ? { policy: process.env.HELMET_REFERRER_POLICY as ReferrerPolicy }
      : undefined,
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID ?? '',
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
    tenantId: process.env.MICROSOFT_TENANT_ID ?? '',
  },
}));
