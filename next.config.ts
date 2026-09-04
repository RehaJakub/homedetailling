import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained build for the Docker image (.next/standalone/server.js).
  output: "standalone",
  // The runtime image applies migrations with scripts/migrate.mjs, which needs
  // the SQL files and drizzle-orm at runtime. Neither is a plain file import of
  // the app (Turbopack bundles drizzle-orm into the server chunks), so both are
  // traced into the standalone output explicitly.
  outputFileTracingIncludes: {
    "/api/*": ["./drizzle/**/*", "./node_modules/drizzle-orm/**/*"],
  },
};

export default nextConfig;
