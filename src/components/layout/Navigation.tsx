"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Home, MessagesSquare, Search, Settings, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useUnreadCount } from "@/hooks/useSocial";
import { useUnreadMessagesCount } from "@/hooks/useMessages";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  /** Для «Ленты» нужно точное совпадение, иначе она подсвечена везде. */
  exact?: boolean;
};

function useNavItems(): NavItem[] {
  const user = useCurrentUser();
  const { data: notifications } = useUnreadCount(Boolean(user));
  const { data: messages } = useUnreadMessagesCount(Boolean(user));

  const items: NavItem[] = [
    { href: "/", label: "Лента", icon: Home, exact: true },
    { href: "/search", label: "Поиск", icon: Search },
  ];

  if (user) {
    items.push(
      {
        href: "/messages",
        label: "Сообщения",
        icon: MessagesSquare,
        badge: messages?.count ?? 0,
      },
      {
        href: "/notifications",
        label: "Уведомления",
        icon: Bell,
        badge: notifications?.count ?? 0,
      },
      { href: `/u/${user.username}`, label: "Профиль", icon: User },
      { href: "/settings", label: "Настройки", icon: Settings },
    );
  }

  return items;
}

function isActive(pathname: string, item: NavItem): boolean {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

/** Боковая навигация — десктоп. */
export function SidebarNav() {
  const pathname = usePathname();
  const items = useNavItems();

  return (
    <nav className="space-y-1" aria-label="Основная навигация">
      {items.map((item) => {
        const active = isActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-full px-4 py-2.5 text-[15px] transition-colors",
              active
                ? "bg-accent-soft font-bold text-accent"
                : "font-medium text-ink-muted hover:bg-surface-hover hover:text-ink",
            )}
          >
            <span className="relative">
              <item.icon className="size-5" strokeWidth={active ? 2.4 : 2} />
              {item.badge ? <UnreadDot count={item.badge} /> : null}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Нижняя панель — мобильные. Подписи скрыты, остаются иконки. */
export function MobileTabBar() {
  const pathname = usePathname();
  const items = useNavItems();

  return (
    <nav
      aria-label="Основная навигация"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur lg:hidden"
      // Учитываем «домашнюю полоску» на iPhone, иначе кнопки под неё уезжают.
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => {
          const active = isActive(pathname, item);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-0.5 py-2.5 transition-colors",
                active ? "text-accent" : "text-ink-faint hover:text-ink-muted",
              )}
            >
              <span className="relative">
                <item.icon className="size-5.5" strokeWidth={active ? 2.4 : 2} />
                {item.badge ? <UnreadDot count={item.badge} /> : null}
              </span>
              <span className="w-full truncate text-center text-[10px] font-semibold">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function UnreadDot({ count }: { count: number }) {
  return (
    <span
      aria-label={`${count} непрочитанных`}
      className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-like px-1 text-[10px] font-bold text-white"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
