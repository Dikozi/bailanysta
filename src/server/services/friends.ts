import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { FriendStatus, Page, UserSummary } from "@/types";
import { userSummarySelect } from "./selects";

export type FriendActionResult = { friendStatus: FriendStatus; friendsCount: number };

async function findUserByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw errors.notFound("Пользователь не найден");
  return user;
}

/** Друг — это ACCEPTED-строка с любой стороны, поэтому считаем и складываем обе. */
async function countFriends(userId: string): Promise<number> {
  const [asSender, asReceiver] = await Promise.all([
    prisma.friendRequest.count({ where: { senderId: userId, status: "ACCEPTED" } }),
    prisma.friendRequest.count({ where: { receiverId: userId, status: "ACCEPTED" } }),
  ]);
  return asSender + asReceiver;
}

/**
 * Отправить заявку в друзья.
 *
 * Если получатель уже сам прислал заявку и она висит непринятой — это
 * и есть согласие обеих сторон, поэтому вторую заявку не создаём, а сразу
 * принимаем встречную. Идемпотентно: повторный клик по уже отправленной
 * или уже принятой заявке ничего не ломает и не плодит уведомлений.
 */
export async function sendFriendRequest(
  userId: string,
  username: string,
): Promise<FriendActionResult> {
  const target = await findUserByUsername(username);
  if (target.id === userId) throw errors.badRequest("Нельзя добавить в друзья самого себя");

  const status: FriendStatus = await prisma.$transaction(async (tx) => {
    const [forward, reverse] = await Promise.all([
      tx.friendRequest.findUnique({
        where: { senderId_receiverId: { senderId: userId, receiverId: target.id } },
      }),
      tx.friendRequest.findUnique({
        where: { senderId_receiverId: { senderId: target.id, receiverId: userId } },
      }),
    ]);

    if (forward) return forward.status === "ACCEPTED" ? "friends" : "outgoing";
    if (reverse?.status === "ACCEPTED") return "friends";

    if (reverse?.status === "PENDING") {
      await tx.friendRequest.update({ where: { id: reverse.id }, data: { status: "ACCEPTED" } });
      await tx.notification.create({
        data: { recipientId: target.id, actorId: userId, type: "FRIEND_ACCEPTED" },
      });
      return "friends";
    }

    await tx.friendRequest.create({ data: { senderId: userId, receiverId: target.id } });
    await tx.notification.create({
      data: { recipientId: target.id, actorId: userId, type: "FRIEND_REQUEST" },
    });
    return "outgoing";
  });

  return { friendStatus: status, friendsCount: await countFriends(target.id) };
}

/** Принять входящую заявку от username. */
export async function acceptFriendRequest(
  userId: string,
  username: string,
): Promise<FriendActionResult> {
  const target = await findUserByUsername(username);

  const request = await prisma.friendRequest.findUnique({
    where: { senderId_receiverId: { senderId: target.id, receiverId: userId } },
  });
  if (!request || request.status !== "PENDING") throw errors.notFound("Заявка не найдена");

  await prisma.$transaction([
    prisma.friendRequest.update({ where: { id: request.id }, data: { status: "ACCEPTED" } }),
    prisma.notification.create({
      data: { recipientId: target.id, actorId: userId, type: "FRIEND_ACCEPTED" },
    }),
  ]);

  return { friendStatus: "friends", friendsCount: await countFriends(target.id) };
}

/**
 * Отклонить входящую заявку от username.
 *
 * Заявка удаляется целиком, а не помечается «отклонена»: statuses всего
 * два (PENDING/ACCEPTED), а не три, и отклонивший может передумать —
 * ничто не мешает отправителю попробовать снова позже.
 */
export async function declineFriendRequest(
  userId: string,
  username: string,
): Promise<FriendActionResult> {
  const target = await findUserByUsername(username);

  await prisma.$transaction(async (tx) => {
    const removed = await tx.friendRequest.deleteMany({
      where: { senderId: target.id, receiverId: userId, status: "PENDING" },
    });
    // Уведомление о заявке снимаем вместе с ней — иначе оно остаётся
    // с неработающими кнопками «Принять/Отклонить» навсегда.
    if (removed.count > 0) {
      await tx.notification.deleteMany({
        where: { type: "FRIEND_REQUEST", actorId: target.id, recipientId: userId },
      });
    }
  });

  return { friendStatus: "none", friendsCount: await countFriends(target.id) };
}

/**
 * Отменить свою исходящую заявку или разорвать существующую дружбу —
 * с точки зрения кнопки на профиле это одно и то же действие «убрать связь»,
 * какой бы она ни была на момент клика.
 */
export async function removeFriendConnection(
  userId: string,
  username: string,
): Promise<FriendActionResult> {
  const target = await findUserByUsername(username);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.friendRequest.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: target.id },
          { senderId: target.id, receiverId: userId },
        ],
      },
    });
    if (existing.length === 0) return;

    await tx.friendRequest.deleteMany({ where: { id: { in: existing.map((row) => row.id) } } });

    // Принятую дружбу трогать не нужно — то, что когда-то приняли,
    // остаётся историческим фактом даже после расставания. А вот отменённая
    // заявка не должна маячить в уведомлениях как ещё не рассмотренная.
    const stillPending = existing.filter((row) => row.status === "PENDING");
    if (stillPending.length > 0) {
      await tx.notification.deleteMany({
        where: {
          type: "FRIEND_REQUEST",
          OR: stillPending.map((row) => ({ actorId: row.senderId, recipientId: row.receiverId })),
        },
      });
    }
  });

  return { friendStatus: "none", friendsCount: await countFriends(target.id) };
}

/**
 * Список друзей — один список вместо прежних раздельных «подписчики»
 * и «подписки»: дружба симметрична, различать стороны больше не нужно.
 */
export async function listFriends(
  username: string,
  options: { cursor?: string; limit: number },
): Promise<Page<UserSummary>> {
  const target = await findUserByUsername(username);
  const cursor = decodeCursor(options.cursor);

  const rows = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ senderId: target.id }, { receiverId: target.id }],
      ...(cursor
        ? {
            AND: [
              {
                OR: [
                  { createdAt: { lt: cursor.createdAt } },
                  { createdAt: cursor.createdAt, id: { lt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: options.limit + 1,
    select: {
      id: true,
      createdAt: true,
      senderId: true,
      sender: { select: userSummarySelect },
      receiver: { select: userSummarySelect },
    },
  });

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const items = page.map((row) => (row.senderId === target.id ? row.receiver : row.sender));
  const last = page.at(-1);

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

/** Быстрая проверка для сервисов вроде сообщений: действительно ли друзья. */
export async function areFriends(userId: string, otherUserId: string): Promise<boolean> {
  const accepted = await prisma.friendRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    select: { id: true },
  });
  return accepted !== null;
}
