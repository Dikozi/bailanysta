import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { deleteComment } from "@/server/services/comments";

type Context = { params: Promise<{ id: string }> };

export const DELETE = route<Context>(async (_request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const commentsCount = await deleteComment(id, user.id);
  return ok({ commentsCount });
});
