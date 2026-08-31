import { cn } from "@/lib/cn";

/** Плашка-заглушка. Геометрию задаёт вызывающий, чтобы совпадать с контентом. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("skeleton rounded-md", className)} />;
}
