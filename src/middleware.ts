import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_SESSION } from "@/lib/constants";
import { verifySession } from "@/server/auth/jwt";

/**
 * Быстрая проверка на границе: страницы, требующие входа, не должны
 * даже начинать рендер для гостя.
 *
 * Здесь только проверка подписи токена — без обращения к базе.
 * Middleware выполняется на каждый запрос, и запрос к Postgres из него
 * добавлял бы задержку ко всей навигации. Настоящая проверка «пользователь
 * ещё существует» остаётся в requireUser() на уровне API.
 */
const PROTECTED = ["/settings", "/notifications"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((path) => pathname.startsWith(path))) return NextResponse.next();

  const token = request.cookies.get(COOKIE_SESSION)?.value;
  const session = token ? await verifySession(token) : null;
  if (session) return NextResponse.next();

  // Запоминаем, куда человек шёл, чтобы после входа вернуть его туда же.
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/settings/:path*", "/notifications/:path*"],
};
