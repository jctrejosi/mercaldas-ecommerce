/// <reference types="vite/client" />
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";
declare module "*.gif";
declare module "*.svg";
declare module "*.webp";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_CREDENTIALS: boolean;
  readonly VITE_ADMIN_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
