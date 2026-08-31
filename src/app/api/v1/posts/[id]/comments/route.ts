import { searchParamsOf } from "@/lib/query";
import { createCommentSchema, paginationSchema } from "@/lib/validation";
import { getSessionUserId, requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { createComment, listComments } from "@/server/services/comments";

type Context = { params: Promise<{ id: string }> };

export const GET = route<Context>(async (request, { params }) => {
  const { id } = await params;
  const options = paginationSchema.parse(searchParamsOf(request));
  return ok(await listComments(id, await getSessionUserId(), options));
});

export const POST = route<Context>(async (request, { params }) => {
  const user = await requireUser();
  const { id } = await params;
  const { content } = createCommentSchema.parse(await request.json());
  return ok(await createComment(id, user.id, content), 201);
});
