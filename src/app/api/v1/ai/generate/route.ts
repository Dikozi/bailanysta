import { aiGenerateSchema } from "@/lib/validation";
import { requireUser } from "@/server/auth/session";
import { generateText } from "@/server/ai/anthropic";
import { ok, route } from "@/server/http";
import { enforceAiRateLimit, recordAiUsage } from "@/server/ratelimit";

export const POST = route(async (request) => {
  const user = await requireUser();
  const input = aiGenerateSchema.parse(await request.json());

  await enforceAiRateLimit(user.id);
  const result = await generateText(input);
  // Считаем только успешные генерации: неудачный запрос не должен съедать лимит.
  await recordAiUsage(user.id, input.mode);

  return ok(result);
});
