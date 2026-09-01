import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ChatView } from "@/components/messages/ChatView";
import { getSessionUserId } from "@/server/auth/session";
import { AppError } from "@/server/http";
import { getProfile } from "@/server/services/users";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `Переписка с @${username}` };
}

export default async function ChatPage({ params }: Props) {
  const viewerId = await getSessionUserId();
  if (!viewerId) redirect("/login");

  const { username } = await params;

  let profile;
  try {
    profile = await getProfile(username.toLowerCase(), viewerId);
  } catch (error) {
    if (error instanceof AppError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <PageHeader title={profile.displayName} subtitle={`@${profile.username}`} />
      {/* Право переписки проверяет и сервер на каждом запросе к /api/v1/messages —
          здесь это лишь ранний выход, чтобы не показывать пустой чат без смысла. */}
      <ChatView peer={profile} canWrite={profile.friendStatus === "friends"} />
    </>
  );
}
