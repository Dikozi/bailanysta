import { updateProfileSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/session";
import { ok, route } from "@/server/http";
import { updateProfile } from "@/server/services/users";

export const PATCH = route(async (request) => {
  const user = await requireUser();
  const input = updateProfileSchema.parse(await request.json());
  return ok(await updateProfile(user.id, input));
});
