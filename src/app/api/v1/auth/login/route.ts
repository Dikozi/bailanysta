import { loginSchema } from "@/lib/validation";
import { setSessionCookie } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { login } from "@/server/services/auth";

export const POST = route(async (request) => {
  const input = loginSchema.parse(await request.json());
  const user = await login(input);
  await setSessionCookie(user.id, user.username);
  return ok(user);
});
