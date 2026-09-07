/** Only JSON objects are accepted; malformed input is a client error, not a 500. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function invalidJson() {
  return Response.json({ error: "Neplatný požadavek. Očekáváme JSON objekt." }, { status: 400 });
}
