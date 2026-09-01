import { searchParamsOf } from "@/lib/query";
import { paginationSchema, sendMessageSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { listMessages, sendMessage } from "@/server/services/messages";

type Context = { params: Promise<{ username: string }> };

export const GET = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  const options = paginationSchema.parse(searchParamsOf(request));
  return ok(await listMessages(user.id, username.toLowerCase(), options));
});

export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { username } = await params;
  const { content } = sendMessageSchema.parse(await request.json());
  return ok(await sendMessage(user.id, username.toLowerCase(), content), 201);
});
