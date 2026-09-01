-- Follow → FriendRequest, добавлены Message и User.status.
--
-- Написана вручную: `prisma migrate dev` в неинтерактивной оболочке
-- отказывается генерировать миграцию, которая удаляет значение enum
-- ('FOLLOW') и роняет непустую таблицу (Follow, 35 строк) — она просит
-- интерактивное подтверждение. Данные тестовые/seed, поэтому подтверждение
-- дано вручную здесь, а не через диалог CLI.

-- Старые уведомления о подписках теряют смысл вместе с самой моделью Follow —
-- перед сменой enum их нужно убрать, иначе ALTER TYPE ... USING упадёт
-- на попытке привести значение 'FOLLOW' к типу, где его больше нет.
DELETE FROM "Notification" WHERE "type" = 'FOLLOW';

-- CreateEnum: Postgres не даёt просто удалить значение из ENUM (кроме
-- новых версий и то не в общем случае) — стандартный путь Prisma: завести
-- новый тип, перелить колонку через USING, подменить тип, снести старый.
CREATE TYPE "NotificationType_new" AS ENUM ('LIKE', 'COMMENT', 'FRIEND_REQUEST', 'FRIEND_ACCEPTED');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
DROP TYPE "NotificationType";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";

-- DropForeignKey
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followerId_fkey";
ALTER TABLE "Follow" DROP CONSTRAINT "Follow_followingId_fkey";

-- DropTable
DROP TABLE "Follow";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "status" VARCHAR(80);

-- CreateEnum
CREATE TYPE "FriendRequestStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- CreateTable
CREATE TABLE "FriendRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "FriendRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FriendRequest_senderId_receiverId_key" ON "FriendRequest"("senderId", "receiverId");
CREATE INDEX "FriendRequest_receiverId_status_idx" ON "FriendRequest"("receiverId", "status");
CREATE INDEX "FriendRequest_senderId_status_idx" ON "FriendRequest"("senderId", "status");

CREATE INDEX "Message_senderId_receiverId_createdAt_idx" ON "Message"("senderId", "receiverId", "createdAt");
CREATE INDEX "Message_receiverId_senderId_createdAt_idx" ON "Message"("receiverId", "senderId", "createdAt");
CREATE INDEX "Message_receiverId_isRead_idx" ON "Message"("receiverId", "isRead");

-- AddForeignKey
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FriendRequest" ADD CONSTRAINT "FriendRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
