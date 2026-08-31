import { searchParamsOf } from "@/lib/query";
import { createPostSchema, feedQuerySchema } from "@/lib/validation";
import { getSessionUserId, requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { createPost, listPosts } from "@/server/services/posts";

/** Лента. Доступна и гостю — просто без отметок «мой пост» и «лайкнуто». */
export const GET = route(async (request) => {
  const query = feedQuerySchema.parse(searchParamsOf(request));
  const viewerId = await getSessionUserId();
  return ok(await listPosts(query, viewerId));
});

export const POST = route(async (request) => {
  const user = await requireUser();
  const { content } = createPostSchema.parse(await request.json());
  return ok(await createPost(user.id, content), 201);
});
