import { searchParamsOf } from "@/lib/query";
import { paginationSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { listNotifications } from "@/server/services/notifications";

export const GET = route(async (request) => {
  const user = await requireUser();
  const options = paginationSchema.parse(searchParamsOf(request));
  return ok(await listNotifications(user.id, options));
});
