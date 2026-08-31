import Link from "next/link";
import { segmentText } from "@/lib/hashtags";

/**
 * Текст поста с кликабельными хэштегами.
 *
 * Разбор идёт при рендере, а не хранением HTML в базе: в базе лежит только
 * то, что написал пользователь, поэтому разметку нельзя внедрить через контент.
 */
export function PostContent({ text }: { text: string }) {
  return (
    <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
      {segmentText(text).map((segment, index) =>
        segment.type === "hashtag" ? (
          <Link
            key={index}
            href={`/tag/${encodeURIComponent(segment.value.toLocaleLowerCase("ru"))}`}
            // stopPropagation: карточка целиком кликабельна, и без этого
            // переход по тегу открывал бы страницу поста.
            onClick={(event) => event.stopPropagation()}
            className="font-medium text-accent hover:underline"
          >
            #{segment.value}
          </Link>
        ) : (
          <span key={index}>{segment.value}</span>
        ),
      )}
    </p>
  );
}
