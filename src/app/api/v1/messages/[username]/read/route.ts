import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { markConversationRead } from "@/server/services/messages";

type Context = { params: Promise<{ username: string }> };

export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  await markConversationRead(user.id, username.toLowerCase());
  return ok({ success: true });
});
