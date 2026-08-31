"use client";

import { createContext, useContext, useState } from "react";
import type { CurrentUser } from "@/types";

type SessionContextValue = {
  user: CurrentUser | null;
  setUser: (user: CurrentUser | null) => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

/**
 * Текущий пользователь приходит с сервера уже в первом рендере,
 * поэтому шапка и композер не «прыгают» после гидрации.
 */
export function SessionProvider({
  initialUser,
  children,
}: {
  initialUser: CurrentUser | null;
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser);
  return <SessionContext.Provider value={{ user, setUser }}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession используется вне SessionProvider");
  return context;
}

/** Короткий доступ там, где нужен только сам пользователь. */
export function useCurrentUser(): CurrentUser | null {
  return useSession().user;
}
