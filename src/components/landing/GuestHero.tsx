import Link from "next/link";
import { plural, POSTS_FORMS } from "@/lib/format";

/**
 * Титульный экран для незалогиненного посетителя.
 *
 * До него первый экран не говорил о проекте ничего: человек видел чужие посты
 * и слово в углу. Здесь появляется момент узнавания — что это, зачем и как
 * зайти, — а живая лента остаётся сразу под ним, чтобы обещание тут же
 * подтверждалось реальным содержимым, а не оставалось рекламным текстом.
 *
 * Серверный компонент: цифры приходят из базы вместе с HTML, без запроса
 * с клиента и без мелькания нулей.
 */
export function GuestHero({
  stats,
}: {
  stats: { authors: number; posts: number; hashtags: number };
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="px-6 py-10 sm:px-10 sm:py-14">
        <p className="text-[12px] font-bold uppercase tracking-wide text-accent">
          Bailanysta
        </p>

        <h1 className="mt-3 font-display text-[34px] leading-[1.15] sm:text-[44px]">
          Байланыс — это связь
        </h1>

        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-ink-muted sm:text-[17px]">
          Место, где короткие мысли находят своих людей. Пишите посты, следите
          за теми, кто интересен, и обсуждайте — без ленты «рекомендованного»
          и без алгоритмов, решающих за вас.
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <Link
            href="/register"
            className="flex h-11 items-center rounded-full bg-accent px-6 text-[15px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Создать аккаунт
          </Link>
          <Link
            href="/login"
            className="flex h-11 items-center rounded-full border border-line-strong px-6 text-[15px] font-semibold transition-colors hover:bg-surface-hover"
          >
            Войти как демо
          </Link>
        </div>

        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
          <Stat value={stats.authors} label={plural(stats.authors, ["автор", "автора", "авторов"])} />
          <Stat value={stats.posts} label={plural(stats.posts, POSTS_FORMS)} />
          <Stat value={stats.hashtags} label={plural(stats.hashtags, ["тема", "темы", "тем"])} />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="font-display text-2xl">{value}</span>{" "}
        <span className="text-[14px] text-ink-muted">{label}</span>
      </dd>
    </div>
  );
}
