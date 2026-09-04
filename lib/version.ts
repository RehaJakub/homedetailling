/**
 * Application version shown in the footer, the admin and `/api/health`.
 * Inlined at build time from `NEXT_PUBLIC_APP_VERSION`, which `next.config.ts`
 * fills from `APP_VERSION` (Docker build arg) or `package.json`.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0";
