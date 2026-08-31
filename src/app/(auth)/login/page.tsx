import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/server/auth/session";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage() {
  // Уже вошедшему на форме входа делать нечего.
  if (await getSessionUserId()) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">С возвращением</h1>
        <p className="mt-1.5 text-sm text-ink-muted">Войдите, чтобы продолжить в Bailanysta.</p>
      </div>

      <Suspense fallback={<div className="h-72" />}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-ink-muted">
        Ещё нет аккаунта?{" "}
        <Link href="/register" className="font-semibold text-accent hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
