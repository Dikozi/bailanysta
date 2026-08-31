import Anthropic from "@anthropic-ai/sdk";
import { POST_MAX_LENGTH } from "@/lib/constants";
import type { AiGenerateInput, AiMode, AiTone } from "@/lib/validation";
import { AppError, errors } from "@/server/http";

/**
 * Единственное место в проекте, где вообще упоминается ANTHROPIC_API_KEY.
 * Модуль импортируется только из route handler'ов, поэтому ключ физически
 * не может попасть в клиентский бандл — этого требует и ТЗ.
 */

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

/** Ответы короткие по определению — пост ограничен 500 символами. */
const MAX_TOKENS = 1024;

const TONE_HINTS: Record<AiTone, string> = {
  neutral: "нейтральный, спокойный",
  friendly: "тёплый и дружелюбный, можно на «ты»",
  professional: "деловой и сдержанный, без сленга",
  witty: "с лёгкой иронией и юмором, но без грубости",
};

const SYSTEM_PROMPT = `Ты — редактор внутри социальной сети Bailanysta.
Помогаешь пользователю писать короткие посты и комментарии.

Правила:
- Отвечай ТОЛЬКО готовым текстом, без вступлений вроде «Вот ваш пост:».
- Не оборачивай ответ в кавычки и не используй markdown-разметку.
- Пиши на том же языке, на котором сформулирован запрос пользователя.
- Пост не длиннее ${POST_MAX_LENGTH} символов.
- Хэштеги пиши слитно, без пробелов внутри, в нижнем регистре.`;

function buildPrompt(input: AiGenerateInput): string {
  const tone = `Тон: ${TONE_HINTS[input.tone]}.`;

  switch (input.mode) {
    case "draft":
      return `Напиши пост для соцсети на тему: «${input.topic ?? ""}».
${tone}
Добавь в конце 2–3 уместных хэштега.`;

    case "improve":
      return `Отредактируй черновик поста: сделай его живее и понятнее,
сохранив смысл, язык оригинала и авторскую интонацию. ${tone}
Не добавляй новых фактов. Верни только итоговый текст.

Черновик:
${input.text ?? ""}`;

    case "hashtags":
      return `Подбери 3–5 хэштегов к посту. Выведи их одной строкой через пробел,
каждый начинается с #. Больше ничего не пиши.

Пост:
${input.text ?? ""}`;

    case "reply":
      return `Предложи короткий содержательный комментарий к посту —
одна-две фразы, по делу, без лести и без повторения текста поста. ${tone}

Пост:
${input.text ?? ""}`;
  }
}

/** Отдельные проверки на режим: у draft обязательна тема, у остальных — текст. */
function assertInput(input: AiGenerateInput): void {
  if (input.mode === "draft" && !input.topic) {
    throw errors.validation({ topic: "Опишите, о чём написать" });
  }
  if (input.mode !== "draft" && !input.text) {
    throw errors.validation({ text: "Нужен текст поста" });
  }
}

export async function generateText(input: AiGenerateInput): Promise<{ text: string; mode: AiMode }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw errors.aiNotConfigured();

  assertInput(input);

  const client = new Anthropic({ apiKey });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      // Задача простая и короткая — низкий effort экономит токены без потери качества.
      output_config: { effort: "low" },
      // Если модель откажется отвечать, запрос автоматически переигрывается
      // на резервной модели, а не падает пользователю в лицо ошибкой.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages: [{ role: "user", content: buildPrompt(input) }],
    });

    if (response.stop_reason === "refusal") {
      throw new AppError(
        422,
        "AI_REFUSED",
        "Модель отказалась генерировать текст по этому запросу. Попробуйте переформулировать.",
      );
    }

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    if (!text) {
      throw new AppError(502, "AI_EMPTY_RESPONSE", "Модель вернула пустой ответ");
    }

    return { text: text.slice(0, POST_MAX_LENGTH), mode: input.mode };
  } catch (error) {
    if (error instanceof AppError) throw error;

    if (error instanceof Anthropic.AuthenticationError) {
      throw new AppError(502, "AI_BAD_KEY", "Ключ Anthropic отклонён — проверьте ANTHROPIC_API_KEY");
    }
    if (error instanceof Anthropic.RateLimitError) {
      throw errors.rateLimited("Anthropic временно ограничил запросы. Попробуйте через минуту.");
    }
    if (error instanceof Anthropic.APIError) {
      console.error("[ai] Ошибка Anthropic API:", error.status, error.message);
      throw new AppError(502, "AI_UPSTREAM_ERROR", "AI-сервис недоступен, попробуйте позже");
    }

    throw error;
  }
}
