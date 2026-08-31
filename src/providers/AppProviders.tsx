"use client";

import type { Theme } from "@/lib/theme";
import type { CurrentUser } from "@/types";
import { QueryProvider } from "./QueryProvider";
import { SessionProvider } from "./SessionProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";

/** Один клиентский компонент на границе — корневой layout остаётся серверным. */
export function AppProviders({
  initialUser,
  initialTheme,
  children,
}: {
  initialUser: CurrentUser | null;
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <ThemeProvider initialTheme={initialTheme}>
        <SessionProvider initialUser={initialUser}>
          <ToastProvider>{children}</ToastProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
