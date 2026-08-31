import { searchParamsOf } from "@/lib/query";
import { searchQuerySchema } from "@/lib/validation";
import { getSessionUserId } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { search } from "@/server/services/search";

export const GET = route(async (request) => {
  const { q } = searchQuerySchema.parse(searchParamsOf(request));
  return ok(await search(q, await getSessionUserId()));
});
