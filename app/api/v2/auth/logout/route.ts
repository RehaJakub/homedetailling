import { clearSessionCookieHeader } from "@/lib/auth";

export async function POST() {
  const response = Response.json({ loggedOut: true });
  response.headers.append("Set-Cookie", clearSessionCookieHeader());
  return response;
}
