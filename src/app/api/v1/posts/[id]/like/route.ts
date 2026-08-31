import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { likePost, unlikePost } from "@/server/services/likes";

type Context = { params: Promise<{ id: string }> };

export const POST = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  return ok(await likePost(id, user.id));
});

export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  return ok(await unlikePost(id, user.id));
});
