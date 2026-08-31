import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUserId } from "@/server/auth/session";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Регистрация" };

export default async function RegisterPage() {
  if (await getSessionUserId()) redirect("/");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight">Создайте аккаунт</h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Пара полей — и можно писать первый пост.
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-ink-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-accent hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
