import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { acceptFriendRequest } from "@/server/services/friends";

type Context = { params: Promise<{ username: string }> };

/** username — тот, кто прислал заявку; принимает её текущий пользователь. */
export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await acceptFriendRequest(user.id, username.toLowerCase()));
});
