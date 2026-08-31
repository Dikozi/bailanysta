import { z } from "zod";
import {
  BIO_MAX_LENGTH,
  COMMENT_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  PAGE_SIZE,
  PAGE_SIZE_MAX,
  PASSWORD_MIN_LENGTH,
  POST_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
} from "./constants";

/**
 * Один набор схем на клиент и сервер: форма и API не могут разойтись в правилах.
 * Сообщения на русском — они же показываются пользователю под полями.
 */

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(USERNAME_MIN_LENGTH, `Минимум ${USERNAME_MIN_LENGTH} символа`)
  .max(USERNAME_MAX_LENGTH, `Максимум ${USERNAME_MAX_LENGTH} символов`)
  .regex(/^[a-z0-9_]+$/, "Только латиница, цифры и подчёркивание");

export const emailSchema = z.email("Похоже на некорректную почту").trim().toLowerCase();

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Минимум ${PASSWORD_MIN_LENGTH} символов`)
  .max(72, "Слишком длинный пароль");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Укажите имя")
  .max(DISPLAY_NAME_MAX_LENGTH, `Максимум ${DISPLAY_NAME_MAX_LENGTH} символов`);

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Введите пароль"),
});

export const postContentSchema = z
  .string()
  .trim()
  .min(1, "Пост не может быть пустым")
  .max(POST_MAX_LENGTH, `Максимум ${POST_MAX_LENGTH} символов`);

export const createPostSchema = z.object({ content: postContentSchema });
export const updatePostSchema = z.object({ content: postContentSchema });

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Комментарий не может быть пустым")
    .max(COMMENT_MAX_LENGTH, `Максимум ${COMMENT_MAX_LENGTH} символов`),
});

export const updateProfileSchema = z.object({
  displayName: displayNameSchema,
  bio: z
    .string()
    .trim()
    .max(BIO_MAX_LENGTH, `Максимум ${BIO_MAX_LENGTH} символов`)
    .nullish()
    .transform((value) => (value === "" ? null : (value ?? null))),
});

/** Строки из query-string, поэтому coerce и мягкие дефолты. */
export const paginationSchema = z.object({
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(PAGE_SIZE_MAX).default(PAGE_SIZE),
});

export const feedQuerySchema = paginationSchema.extend({
  feed: z.enum(["global", "following"]).default("global"),
  authorId: z.string().min(1).optional(),
  tag: z.string().min(1).optional(),
  q: z.string().trim().min(1).max(100).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1, "Введите запрос").max(100),
});

export const aiGenerateSchema = z.object({
  mode: z.enum(["draft", "improve", "hashtags", "reply"]),
  topic: z.string().trim().max(200).optional(),
  text: z.string().trim().max(POST_MAX_LENGTH).optional(),
  tone: z.enum(["neutral", "friendly", "professional", "witty"]).default("neutral"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FeedQuery = z.infer<typeof feedQuerySchema>;
export type AiGenerateInput = z.infer<typeof aiGenerateSchema>;
export type AiMode = AiGenerateInput["mode"];
export type AiTone = AiGenerateInput["tone"];
