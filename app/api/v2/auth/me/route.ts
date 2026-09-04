import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Nepřihlášený uživatel." }, { status: 401 });
  return Response.json({ user });
}
