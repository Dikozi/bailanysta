import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { removeFriendConnection, sendFriendRequest } from "@/server/services/friends";

type Context = { params: Promise<{ username: string }> };

/** Отправить заявку в друзья (или принять уже ждущую встречную — см. сервис). */
export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await sendFriendRequest(user.id, username.toLowerCase()));
});

/** Отменить свою заявку или разорвать существующую дружбу. */
export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  return ok(await removeFriendConnection(user.id, username.toLowerCase()));
});
