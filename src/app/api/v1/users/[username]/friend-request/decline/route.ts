import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { declineFriendRequest } from "@/server/services/friends";

type Context = { params: Promise<{ username: string }> };

export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await declineFriendRequest(user.id, username.toLowerCase()));
});
