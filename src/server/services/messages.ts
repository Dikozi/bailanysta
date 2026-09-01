import { Prisma } from "@/generated/prisma/client";
import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import { errors } from "@/server/http";
import type { Conversation, Message, Page } from "@/types";
import { areFriends } from "./friends";
import { userSummarySelect } from "./selects";

const CONVERSATIONS_LIMIT = 50;

async function findUserByUsername(username: string) {
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) throw errors.notFound("Пользователь не найден");
  return user;
}

/** Переписка закрыта сразу с обеих сторон: и на чтение, и на отправку. */
async function requireFriendship(userId: string, otherUserId: string): Promise<void> {
  if (userId === otherUserId) throw errors.badRequest("Нельзя написать самому себе");
  if (!(await areFriends(userId, otherUserId))) {
    throw errors.forbidden("Переписка доступна только между друзьями");
  }
}

type ConversationRow = {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: Date;
};

/**
 * Список бесед: по одному последнему сообщению на каждую пару собеседников.
 *
 * Обычным Prisma-запросом «последняя строка в каждой группе» не выразить —
 * нужен DISTINCT ON, специфичный для Postgres. Пара канонизируется через
 * LEAST/GREATEST, чтобы (A,B) и (B,A) считались одной и той же беседой
 * независимо от того, кто кому писал последним.
 *
 * Внутренний ORDER BY на DISTINCT ON обязателен начинаться с тех же
 * выражений, что и сам DISTINCT ON, — поэтому сортировка по времени
 * для итогового списка бесед берётся во внешнем запросе, а не в этом.
 */
export async function listConversations(userId: string): Promise<Conversation[]> {
  const latest = await prisma.$queryRaw<ConversationRow[]>(Prisma.sql`
    SELECT * FROM (
      SELECT DISTINCT ON (LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"))
        id, "senderId", "receiverId", content, "createdAt"
      FROM "Message"
      WHERE "senderId" = ${userId} OR "receiverId" = ${userId}
      ORDER BY LEAST("senderId", "receiverId"), GREATEST("senderId", "receiverId"), "createdAt" DESC
    ) AS latest
    ORDER BY "createdAt" DESC
    LIMIT ${CONVERSATIONS_LIMIT}
  `);

  if (latest.length === 0) return [];

  const peerIds = latest.map((row) => (row.senderId === userId ? row.receiverId : row.senderId));

  const [peers, unreadRows] = await Promise.all([
    prisma.user.findMany({ where: { id: { in: peerIds } }, select: userSummarySelect }),
    prisma.message.groupBy({
      by: ["senderId"],
      where: { receiverId: userId, isRead: false, senderId: { in: peerIds } },
      _count: { _all: true },
    }),
  ]);

  const peerById = new Map(peers.map((peer) => [peer.id, peer]));
  const unreadByPeer = new Map(unreadRows.map((row) => [row.senderId, row._count._all]));

  return latest
    .map((row) => {
      const peerId = row.senderId === userId ? row.receiverId : row.senderId;
      const peer = peerById.get(peerId);
      if (!peer) return null; // защитная развязка на случай удалённого аккаунта
      return {
        peer,
        lastMessage: {
          content: row.content,
          createdAt: row.createdAt.toISOString(),
          isMine: row.senderId === userId,
        },
        unreadCount: unreadByPeer.get(peerId) ?? 0,
      } satisfies Conversation;
    })
    .filter((row): row is Conversation => row !== null);
}

/** Суммарный бейдж непрочитанных — для иконки в навигации, опрашивается по таймеру. */
export function countUnreadMessages(userId: string): Promise<number> {
  return prisma.message.count({ where: { receiverId: userId, isRead: false } });
}

export async function listMessages(
  userId: string,
  peerUsername: string,
  options: { cursor?: string; limit: number },
): Promise<Page<Message>> {
  const peer = await findUserByUsername(peerUsername);
  await requireFriendship(userId, peer.id);

  const cursor = decodeCursor(options.cursor);

  const rows = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: peer.id },
        { senderId: peer.id, receiverId: userId },
      ],
      ...(cursor
        ? {
            AND: [
              {
                OR: [
                  { createdAt: { gt: cursor.createdAt } },
                  { createdAt: cursor.createdAt, id: { gt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    take: options.limit + 1,
    select: { id: true, content: true, createdAt: true, senderId: true },
  });

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const last = page.at(-1);

  return {
    items: page.map((row) => ({
      id: row.id,
      content: row.content,
      createdAt: row.createdAt.toISOString(),
      isMine: row.senderId === userId,
    })),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

export async function sendMessage(
  userId: string,
  peerUsername: string,
  content: string,
): Promise<Message> {
  const peer = await findUserByUsername(peerUsername);
  await requireFriendship(userId, peer.id);

  const created = await prisma.message.create({
    data: { senderId: userId, receiverId: peer.id, content },
    select: { id: true, content: true, createdAt: true },
  });

  return { id: created.id, content: created.content, createdAt: created.createdAt.toISOString(), isMine: true };
}

export async function markConversationRead(userId: string, peerUsername: string): Promise<void> {
  const peer = await findUserByUsername(peerUsername);

  await prisma.message.updateMany({
    where: { senderId: peer.id, receiverId: userId, isRead: false },
    data: { isRead: true },
  });
}
