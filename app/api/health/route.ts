// Liveness probe for container healthchecks. Deliberately touches no database.
export function GET() {
  return Response.json({ ok: true });
}
