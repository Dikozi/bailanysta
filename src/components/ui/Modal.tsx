"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Простое модальное окно: фон, Escape, блокировка прокрутки под ним,
 * ловушка фокуса.
 *
 * Без ловушки Tab уводил фокус в контент позади затемнения — пользователь
 * с клавиатуры или скринридером оказывался «вне» открытого диалога, хотя
 * визуально он ещё на экране. Стандартный паттерн для диалогов (ARIA APG)
 * требует держать фокус внутри, пока окно открыто, и вернуть его туда,
 * откуда пришли, после закрытия.
 */
export function Modal({
  title,
  onClose,
  restoreFocusTo,
  children,
}: {
  title: string;
  onClose: () => void;
  /**
   * Куда вернуть фокус после закрытия, если авто-определение не годится.
   *
   * По умолчанию окно запоминает document.activeElement на момент открытия —
   * это работает, если модалку открыла обычная кнопка. Но если её открыл пункт
   * выпадающего меню, к моменту монтирования окна пункт уже размонтирован
   * вместе со всем меню, и document.activeElement — это уже <body>. Вызывающая
   * сторона в этом случае передаёт явную ссылку на настоящую кнопку-триггер
   * (например, «⋯» у карточки поста), которая пережила закрытие меню.
   */
  restoreFocusTo?: HTMLElement | null;
  children: React.ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Возвращаем фокус туда, откуда открыли окно — иначе после закрытия
    // он остаётся на теле документа, и клавиатурная навигация «теряется».
    const previouslyFocused =
      restoreFocusTo !== undefined ? restoreFocusTo : (document.activeElement as HTMLElement | null);

    const focusables = () =>
      Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);

    // Фокус — на первый элемент внутри диалога, а не на сам div: так скринридер
    // сразу озвучивает что-то интерактивное, а не безымянный контейнер.
    focusables()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab") return;

      // Список запрашивается заново на каждый Tab: содержимое диалога может
      // меняться (например, кнопка дизейблится во время отправки формы).
      const items = focusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // Иначе фон прокручивается «под» окном, что дезориентирует на мобильном.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, restoreFocusTo]);

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      // Окно часто открывается изнутри кликабельной карточки. Без остановки
      // всплытия клик по подложке уходил бы «сквозь» и открывал пост.
      onClick={(event) => event.stopPropagation()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="animate-pop-in w-full max-w-lg rounded-t-card border border-line bg-surface shadow-pop sm:rounded-card"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-m-1.5 rounded-full p-1.5 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <X className="size-4.5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
