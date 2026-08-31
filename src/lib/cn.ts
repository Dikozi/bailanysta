/** Склейка классов: отбрасывает false/undefined, чтобы не писать тернарники в JSX. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
