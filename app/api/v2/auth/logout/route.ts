import { sessionCookieName } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ loggedOut: true });
  response.headers.append("Set-Cookie", `${sessionCookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return response;
}
