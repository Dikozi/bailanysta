import { decodeCursor, encodeCursor } from "@/lib/cursor";
import { prisma } from "@/server/db";
import type { Notification, Page } from "@/types";
import { notificationSelect, toNotificationDTO } from "./selects";

export async function listNotifications(
  userId: string,
  options: { cursor?: string; limit: number },
): Promise<Page<Notification>> {
  const cursor = decodeCursor(options.cursor);

  const rows = await prisma.notification.findMany({
    where: {
      recipientId: userId,
      ...(cursor
        ? {
            OR: [
              { createdAt: { lt: cursor.createdAt } },
              { createdAt: cursor.createdAt, id: { lt: cursor.id } },
            ],
          }
        : {}),
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: options.limit + 1,
    select: notificationSelect,
  });

  const hasMore = rows.length > options.limit;
  const page = hasMore ? rows.slice(0, options.limit) : rows;
  const last = page.at(-1);

  return {
    items: page.map(toNotificationDTO),
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.createdAt, id: last.id }) : null,
  };
}

/** Только счётчик — этот запрос клиент дёргает по таймеру, он должен быть дешёвым. */
export function countUnreadNotifications(userId: string): Promise<number> {
  return prisma.notification.count({ where: { recipientId: userId, isRead: false } });
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { recipientId: userId, isRead: false },
    data: { isRead: true },
  });
}
