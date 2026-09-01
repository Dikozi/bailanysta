"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, PenSquare } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Menu, MenuItem } from "@/components/ui/Menu";
import { useLogout } from "@/hooks/useAuth";
import { useCurrentUser } from "@/providers/SessionProvider";
import { Logo } from "./Logo";
import { MobileTabBar, SidebarNav } from "./Navigation";
import { ThemeToggle } from "./ThemeToggle";
import { TrendingRail } from "./TrendingRail";

/**
 * Каркас приложения: три колонки на десктопе, одна колонка плюс нижняя
 * панель на мобильном.
 *
 * Лента ограничена 600px не из-за сетки, а из-за читаемости: строка длиннее
 * ~75 знаков заставляет глаз терять начало следующей строки.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const router = useRouter();

  // Кнопка «Написать» ставит курсор в форму на текущей странице,
  // а с внутренних экранов сначала возвращает в ленту, где форма есть.
  const focusComposer = () => {
    const composer = document.querySelector<HTMLTextAreaElement>("[data-composer-input]");
    if (composer) {
      composer.scrollIntoView({ behavior: "smooth", block: "center" });
      composer.focus();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1240px] gap-8 px-0 sm:px-6">
      {/* Левая колонка: липкая, прокручивается вместе со страницей до упора. */}
      <aside className="sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col justify-between py-6 lg:flex">
        <div className="space-y-8">
          <div className="px-4">
            <Logo />
          </div>
          <SidebarNav />
          {user && (
            <div className="px-2">
              <Button className="w-full" size="lg" onClick={focusComposer}>
                <PenSquare className="size-4" />
                Написать
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4 px-2">
          <ThemeToggle />
          {user ? <AccountMenu /> : <GuestActions />}
        </div>
      </aside>

      {/* Центральная колонка — контент.
          Границ у колонки нет: структуру теперь задают сами карточки,
          и вторая рамка вокруг них только загрязняла бы картинку. */}
      <main className="min-w-0 flex-1 px-3 pb-24 sm:px-0 lg:max-w-[640px] lg:pb-24">
        <MobileHeader />
        {children}
      </main>

      {/* Правая колонка: тренды. Скрыта до xl, чтобы не жать ленту. */}
      <aside className="sticky top-0 hidden h-screen w-[300px] shrink-0 overflow-y-auto py-6 xl:block">
        <TrendingRail />
      </aside>

      <MobileTabBar />
    </div>
  );
}

function MobileHeader() {
  const user = useCurrentUser();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-ground/90 px-4 py-3 backdrop-blur lg:hidden">
      <Logo />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user ? (
          <Link href={`/u/${user.username}`} aria-label="Мой профиль">
            <Avatar displayName={user.displayName} avatarColor={user.avatarColor} size="sm" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex h-8 items-center rounded-full bg-accent px-3.5 text-[13px] font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
          >
            Войти
          </Link>
        )}
      </div>
    </header>
  );
}

function AccountMenu() {
  const user = useCurrentUser();
  const logout = useLogout();
  if (!user) return null;

  return (
    <Menu
      align="start"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-full p-2 text-left transition-colors hover:bg-surface-hover"
        >
          <Avatar displayName={user.displayName} avatarColor={user.avatarColor} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{user.displayName}</span>
            <span className="block truncate text-[13px] text-ink-muted">@{user.username}</span>
          </span>
        </button>
      )}
    >
      {({ close }) => (
        <MenuItem
          icon={LogOut}
          onClick={() => {
            close();
            logout.mutate();
          }}
        >
          Выйти из аккаунта
        </MenuItem>
      )}
    </Menu>
  );
}

function GuestActions() {
  return (
    <div className="space-y-2">
      <Link
        href="/login"
        className="flex h-10 items-center justify-center rounded-full bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-hover"
      >
        Войти
      </Link>
      <Link
        href="/register"
        className="flex h-10 items-center justify-center rounded-full border border-line-strong px-4 text-sm font-semibold transition-colors hover:bg-surface-hover"
      >
        Создать аккаунт
      </Link>
    </div>
  );
}
