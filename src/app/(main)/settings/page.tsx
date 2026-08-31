import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { getSessionUserId } from "@/server/auth/session";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Настройки" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  if (!(await getSessionUserId())) redirect("/login");

  return (
    <>
      <PageHeader title="Настройки" />
      <SettingsForm />
    </>
  );
}
