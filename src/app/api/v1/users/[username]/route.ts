import { getSessionUserId } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { getProfile } from "@/server/services/users";

type Context = { params: Promise<{ username: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  const { username } = await params;
  return ok(await getProfile(username.toLowerCase(), await getSessionUserId()));
});
