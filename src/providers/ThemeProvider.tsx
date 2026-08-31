"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { COOKIE_THEME } from "@/lib/constants";
import type { Theme } from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Тема хранится в cookie, а не в localStorage.
 *
 * localStorage читается только после гидрации, поэтому страница успевает
 * моргнуть светлым фоном. Cookie уезжает на сервер вместе с запросом,
 * и нужный data-theme попадает в HTML ещё до первого кадра.
 */
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);

    const root = document.documentElement;
    if (next === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", next);

    // Год жизни: выбор темы должен пережить закрытие вкладки.
    document.cookie = `${COOKIE_THEME}=${next}; path=/; max-age=31536000; samesite=lax`;
  }, []);

  // Если выбрано «как в системе», следим за сменой системной темы на лету.
  useEffect(() => {
    if (theme !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => document.documentElement.removeAttribute("data-theme");
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme используется вне ThemeProvider");
  return context;
}
