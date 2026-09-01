import { pickAvatarColor } from "@/lib/constants";
import type { LoginInput, RegisterInput } from "@/lib/validation";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { enforceLoginRateLimit, recordFailedLogin } from "@/server/ratelimit";
import type { CurrentUser } from "@/types";

const currentUserSelect = {
  id: true,
  email: true,
  username: true,
  displayName: true,
  avatarColor: true,
  bio: true,
} as const;

export async function register(input: RegisterInput): Promise<CurrentUser> {
  // Проверяем оба поля сразу, чтобы форма подсветила всё занятое за один заход,
  // а не заставляла пользователя отправлять её дважды.
  const existing = await prisma.user.findMany({
    where: { OR: [{ email: input.email }, { username: input.username }] },
    select: { email: true, username: true },
  });

  if (existing.length > 0) {
    const fields: Record<string, string> = {};
    if (existing.some((user) => user.email === input.email)) {
      fields.email = "Эта почта уже зарегистрирована";
    }
    if (existing.some((user) => user.username === input.username)) {
      fields.username = "Такой ник уже занят";
    }
    throw errors.conflict("Пользователь уже существует", fields);
  }

  return prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      displayName: input.displayName,
      passwordHash: await hashPassword(input.password),
      avatarColor: pickAvatarColor(input.username),
    },
    select: currentUserSelect,
  });
}

export async function login(input: LoginInput): Promise<CurrentUser> {
  // Проверяется до похода в базу за пользователем: смысла тратить запрос
  // на заведомо заблокированную попытку нет.
  await enforceLoginRateLimit(input.email);

  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { ...currentUserSelect, passwordHash: true },
  });

  // Одинаковый ответ на «нет такой почты» и «неверный пароль»:
  // иначе форма входа превращается в способ проверять, кто зарегистрирован.
  const invalid = errors.unauthorized("Неверная почта или пароль");
  if (!user) {
    // Всё равно считаем хеш, чтобы по времени ответа нельзя было отличить случаи.
    await verifyPassword(input.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
    await recordFailedLogin(input.email);
    throw invalid;
  }

  const matches = await verifyPassword(input.password, user.passwordHash);
  if (!matches) {
    await recordFailedLogin(input.email);
    throw invalid;
  }

  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}
