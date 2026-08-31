import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <span className="mb-5 flex size-14 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <Compass className="size-6" />
      </span>
      <p className="font-display text-5xl leading-none">404</p>
      <h1 className="mt-3 font-display text-2xl">Такой страницы нет</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Возможно, пост удалили или в ссылке опечатка.
      </p>
      <Link
        href="/"
        className="mt-6 flex h-11 items-center rounded-full bg-accent px-6 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        Вернуться в ленту
      </Link>
    </div>
  );
}
