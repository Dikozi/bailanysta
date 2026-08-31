import { searchParamsOf } from "@/lib/query";
import { paginationSchema } from "@/lib/validation";
import { ok, route } from "@/server/http";
import { listFollowers } from "@/server/services/follows";

type Context = { params: Promise<{ username: string }> };

export const GET = route<Context>(async (request, { params }) => {
  const { username } = await params;
  const options = paginationSchema.parse(searchParamsOf(request));
  return ok(await listFollowers(username.toLowerCase(), options));
});
