import { MAX_HASHTAGS_PER_POST } from "./constants";

/**
 * Хэштег — «#» плюс буквы/цифры/подчёркивания любого алфавита.
 * \p{L} с флагом u важен: без него кириллица и казахские буквы не распознаются.
 */
export const HASHTAG_PATTERN = /#([\p{L}\p{N}_]{1,50})/gu;

/** Нормализуем к нижнему регистру, чтобы #Almaty и #almaty были одним тегом. */
export function normalizeTag(tag: string): string {
  return tag.replace(/^#/, "").toLocaleLowerCase("ru");
}

/** Уникальные теги поста в порядке появления, не больше лимита. */
export function extractHashtags(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    const tag = normalizeTag(match[1]);
    // Тег из одних цифр — это, скорее всего, «#1» в перечислении, а не тема.
    if (!/^\d+$/.test(tag)) found.add(tag);
    if (found.size >= MAX_HASHTAGS_PER_POST) break;
  }
  return [...found];
}

/** Разбор текста на куски для рендера: обычный текст и кликабельные теги. */
export type TextSegment = { type: "text"; value: string } | { type: "hashtag"; value: string };

export function segmentText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(HASHTAG_PATTERN)) {
    const start = match.index ?? 0;
    if (start > lastIndex) segments.push({ type: "text", value: text.slice(lastIndex, start) });
    segments.push({ type: "hashtag", value: match[1] });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) segments.push({ type: "text", value: text.slice(lastIndex) });
  return segments;
}
