import { registerSchema } from "@/lib/validation";
import { setSessionCookie } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { register } from "@/server/services/auth";

export const POST = route(async (request) => {
  const input = registerSchema.parse(await request.json());
  const user = await register(input);
  await setSessionCookie(user.id, user.username);
  return ok(user, 201);
});
