const MAX_JSON_BYTES = 64 * 1024;

/** Only small JSON objects are accepted; malformed input is a client error, not a 500. */
export async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
    const declared = Number(request.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > MAX_JSON_BYTES) return null;
    if (!request.body) return null;
    const reader = request.body.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let raw = "";
    let bytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_JSON_BYTES) {
        await reader.cancel();
        return null;
      }
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
    if (!raw) return null;
    const body: unknown = JSON.parse(raw);
    return body !== null && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

/**
 * CSRF defense for every state-changing endpoint. The custom header cannot be
 * sent by a cross-origin HTML form and a cross-origin fetch fails CORS preflight.
 */
export function rejectUnsafeMutation(request: Request): Response | null {
  if (request.headers.get("x-requested-with") !== "XMLHttpRequest") return forbiddenRequest();
  const site = request.headers.get("sec-fetch-site");
  if (site === "cross-site" || site === "same-site") return forbiddenRequest();
  const origin = request.headers.get("origin");
  if (origin && !isRequestOrigin(origin, request)) return forbiddenRequest();
  return null;
}

/**
 * Next receives the container URL behind the production reverse proxy. Accept
 * the public origin supplied by that trusted proxy while keeping an exact
 * scheme-and-host comparison. The first value is the client-facing hop.
 */
function isRequestOrigin(origin: string, request: Request) {
  let parsedOrigin: URL;
  try {
    parsedOrigin = new URL(origin);
  } catch {
    return false;
  }
  if (parsedOrigin.origin === new URL(request.url).origin) return true;

  const forwardedHost = firstForwardedValue(request.headers.get("x-forwarded-host"));
  const forwardedProto = firstForwardedValue(request.headers.get("x-forwarded-proto"));
  if (!forwardedHost || (forwardedProto !== "http" && forwardedProto !== "https")) return false;

  return parsedOrigin.origin === `${forwardedProto}://${forwardedHost}`;
}

function firstForwardedValue(header: string | null) {
  return header?.split(",", 1)[0]?.trim().toLowerCase() || null;
}

function forbiddenRequest() {
  return Response.json({ error: "Požadavek z nepovoleného zdroje." }, { status: 403 });
}

export function invalidJson() {
  return Response.json({ error: "Neplatný požadavek. Očekáváme JSON objekt." }, { status: 400 });
}
