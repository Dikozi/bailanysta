import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { NotificationList } from "@/components/layout/NotificationList";
import { getSessionUserId } from "@/server/auth/session";

export const metadata: Metadata = { title: "Уведомления" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  // Дублирует проверку в middleware, но защищает и при прямом рендере.
  if (!(await getSessionUserId())) redirect("/login");

  return (
    <>
      <PageHeader title="Уведомления" />
      <NotificationList />
    </>
  );
}
