import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConversationList } from "@/components/messages/ConversationList";
import { getSessionUserId } from "@/server/auth/session";

export const metadata: Metadata = { title: "Сообщения" };
export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  // Дублирует проверку в middleware, но защищает и при прямом рендере.
  if (!(await getSessionUserId())) redirect("/login");

  return (
    <>
      <PageHeader title="Сообщения" />
      <ConversationList />
    </>
  );
}
