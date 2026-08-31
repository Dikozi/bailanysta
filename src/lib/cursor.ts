/**
 * Keyset-пагинация вместо OFFSET.
 *
 * OFFSET на глубине заставляет Postgres пересчитывать все пропущенные строки,
 * а при вставке новых постов страницы «съезжают» и элементы дублируются.
 * Курсор фиксирует позицию по паре (createdAt, id) — уникальной и отсортированной,
 * поэтому страница всегда продолжается ровно там, где закончилась предыдущая.
 */

export type Cursor = { createdAt: Date; id: string };

function toBase64Url(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 =
    typeof btoa === "function" ? btoa(binary) : Buffer.from(input, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(input: string): string {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  if (typeof atob === "function") {
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(padded, "base64").toString("utf8");
}

export function encodeCursor(cursor: Cursor): string {
  return toBase64Url(`${cursor.createdAt.toISOString()}|${cursor.id}`);
}

/** Возвращает null на любом мусоре — некорректный курсор не должен ронять запрос. */
export function decodeCursor(raw: string | null | undefined): Cursor | null {
  if (!raw) return null;
  let decoded: string;
  try {
    decoded = fromBase64Url(raw);
  } catch {
    return null;
  }
  const separator = decoded.indexOf("|");
  if (separator === -1) return null;

  const createdAt = new Date(decoded.slice(0, separator));
  const id = decoded.slice(separator + 1);
  if (Number.isNaN(createdAt.getTime()) || id.length === 0) return null;

  return { createdAt, id };
}
