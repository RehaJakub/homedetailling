import { requireUser } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/settings";
import { parseSettings } from "@/lib/validation";

export async function GET(request: Request) {
  const auth = await requireUser(request, ["admin", "manager", "viewer"]);
  if (auth.error) return auth.error;
  return Response.json({ settings: await getSettings() });
}

export async function PUT(request: Request) {
  const auth = await requireUser(request, ["admin", "manager"]);
  if (auth.error) return auth.error;
  const parsed = parseSettings((await request.json()) as Record<string, unknown>);
  if (!parsed) return Response.json({ error: "Neplatné nastavení provozní doby." }, { status: 400 });
  return Response.json({ settings: await saveSettings(parsed) });
}
