import { ok, route } from "@/server/http";
import { getTrendingHashtags } from "@/server/services/hashtags";

export const GET = route(async () => {
  return ok(await getTrendingHashtags());
});
