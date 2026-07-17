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

export interface AppConfig {
  port: number;
  nodeEnv: string;
}

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

export interface WompiConfig {
  publicKey: string;
  privateKey: string;
  integrityKey: string;
  apiUrl: string;
  redirectUrl: string;
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
