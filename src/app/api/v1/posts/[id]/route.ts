import { updatePostSchema } from "@/lib/validation";
import { getSessionUserId, requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { deletePost, getPost, updatePost } from "@/server/services/posts";

type Context = { params: Promise<{ id: string }> };

export const GET = route<Context>(async (_request, { params }) => {
  const { id } = await params;
  return ok(await getPost(id, await getSessionUserId()));
});

export const PATCH = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { content } = updatePostSchema.parse(await request.json());
  return ok(await updatePost(id, user.id, content));
});

export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  await deletePost(id, user.id);
  return ok({ success: true });
});
