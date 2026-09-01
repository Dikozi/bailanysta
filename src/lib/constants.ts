/** Общие ограничения и константы, одинаковые для клиента и сервера. */

/**
 * Публичный адрес сайта — источник истины для Open Graph, robots.txt
 * и sitemap.xml. Без переменной окружения используется адрес дев-сервера,
 * чтобы localhost не пытался генерировать абсолютные ссылки на прод.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const POST_MAX_LENGTH = 500;
export const COMMENT_MAX_LENGTH = 300;
export const BIO_MAX_LENGTH = 200;
export const DISPLAY_NAME_MAX_LENGTH = 40;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;
export const PASSWORD_MIN_LENGTH = 8;

/** Сколько элементов отдаёт одна страница ленты/списков. */
export const PAGE_SIZE = 20;
export const PAGE_SIZE_MAX = 50;

/** Сколько хэштегов максимум привязываем к посту. */
export const MAX_HASHTAGS_PER_POST = 10;

/** AI-ассистент: не больше N генераций на пользователя за час. */
export const AI_RATE_LIMIT = 15;
export const AI_RATE_WINDOW_MS = 60 * 60 * 1000;

/**
 * Лимит неудачных попыток входа на один email за окно.
 * 8 за 15 минут — легко прощает опечатку в пароле дважды-трижды подряд,
 * но делает автоматический перебор пароля бессмысленным по скорости.
 */
export const LOGIN_ATTEMPT_LIMIT = 8;
export const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

/** Как часто клиент опрашивает счётчик непрочитанных уведомлений. */
export const NOTIFICATIONS_POLL_MS = 30_000;

/**
 * Палитра аватаров. Картинки не загружаем — вместо них инициалы на фоне,
 * цвет выбирается детерминированно по нику, чтобы не меняться между сессиями.
 */
export const AVATAR_COLORS = [
  "amber",
  "rose",
  "violet",
  "sky",
  "emerald",
  "orange",
  "cyan",
  "fuchsia",
] as const;

export type AvatarColor = (typeof AVATAR_COLORS)[number];

/** Устойчивый выбор цвета по строке (FNV-1a — короткий и без коллизий на наших объёмах). */
export function pickAvatarColor(seed: string): AvatarColor {
  let hash = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export const COOKIE_SESSION = "bailanysta_session";
export const COOKIE_THEME = "bailanysta_theme";
