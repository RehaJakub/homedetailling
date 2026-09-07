import { requireUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { parseSettings } from "@/lib/validation";
import { invalidJson, readJsonObject, rejectUnsafeMutation } from "@/lib/request";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  return Response.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const rejected = rejectUnsafeMutation(request);
  if (rejected) return rejected;
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const body = await readJsonObject(request);
  if (!body) return invalidJson();
  const parsed = parseSettings(body);
  if (!parsed) return Response.json({ error: "Neplatné nastavení provozní doby." }, { status: 400 });
  return Response.json({ settings: await saveSettings(parsed) });
}
