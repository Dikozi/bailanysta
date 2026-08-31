import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { followUser, unfollowUser } from "@/server/services/follows";

type Context = { params: Promise<{ username: string }> };

export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await followUser(user.id, username.toLowerCase()));
});

export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await unfollowUser(user.id, username.toLowerCase()));
});
