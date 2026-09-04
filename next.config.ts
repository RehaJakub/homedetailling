import { readFileSync } from "node:fs";
import type { NextConfig } from "next";

const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/*": ["./drizzle/**/*", "./node_modules/drizzle-orm/**/*"],
  },
  env: {
    // Docker passes APP_VERSION (release build); local builds fall back to package.json.
    NEXT_PUBLIC_APP_VERSION: process.env.APP_VERSION || pkg.version,
  },
};

export default nextConfig;
