import { format, isThisYear } from "date-fns";
import { ru } from "date-fns/locale";

/**
 * Компактное относительное время для ленты: «5 мин», «3 ч», «2 д»,
 * дальше — обычная дата. Готовый formatDistanceToNow даёт «около 3 часов
 * назад» — для плотного списка карточек это слишком длинно.
 */
export function relativeTime(iso: string): string {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "только что";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} мин`;
  if (seconds < 86_400) return `${Math.floor(seconds / 3600)} ч`;
  if (seconds < 604_800) return `${Math.floor(seconds / 86_400)} д`;

  return format(date, isThisYear(date) ? "d MMM" : "d MMM yyyy", { locale: ru });
}

/** Полная дата для title — при наведении видно точное время. */
export function absoluteTime(iso: string): string {
  return format(new Date(iso), "d MMMM yyyy, HH:mm", { locale: ru });
}

/**
 * Месяц в родительном падеже: фраза «С нами с августа 2026».
 * Шаблон MMMM даёт «августа», LLLL — «август», и с предлогом «с»
 * второй вариант читается как ошибка.
 */
export function joinedAt(iso: string): string {
  return format(new Date(iso), "MMMM yyyy", { locale: ru });
}

/**
 * Русские склонения: 1 пост, 2 поста, 5 постов.
 * forms = [один, два, пять].
 */
export function plural(count: number, forms: [string, string, string]): string {
  const mod100 = Math.abs(count) % 100;
  const mod10 = mod100 % 10;

  if (mod100 > 10 && mod100 < 20) return forms[2];
  if (mod10 === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4) return forms[1];
  return forms[2];
}

export function withPlural(count: number, forms: [string, string, string]): string {
  return `${count} ${plural(count, forms)}`;
}

export const POSTS_FORMS: [string, string, string] = ["пост", "поста", "постов"];
export const FOLLOWERS_FORMS: [string, string, string] = ["подписчик", "подписчика", "подписчиков"];
export const COMMENTS_FORMS: [string, string, string] = [
  "комментарий",
  "комментария",
  "комментариев",
];
