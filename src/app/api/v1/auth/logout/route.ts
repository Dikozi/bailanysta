import { clearSessionCookie } from "@/server/auth/session";
import { ok, route } from "@/server/http";

export const POST = route(async () => {
  await clearSessionCookie();
  return ok({ success: true });
});
