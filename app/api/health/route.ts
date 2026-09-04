import { APP_VERSION } from "@/lib/version";

// Liveness probe for container healthchecks. Deliberately touches no database.
export function GET() {
  return Response.json({ ok: true, version: APP_VERSION });
}
