// Shared by vitest.config.mts (project `env`) and global-setup.ts (main process),
// so both sides agree on the database and secrets the integration suite uses.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://homedetailing:homedetailing_dev@127.0.0.1:5432/homedetailing_test";
export const TEST_JWT_SECRET = "integration-test-secret-not-for-production-use";
export const TEST_REGISTRATION_CODE = "integration-registration-code";
