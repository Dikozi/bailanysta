"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useLogin } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";

/** Данные демо-аккаунта из seed — чтобы проверяющий вошёл в один клик. */
const DEMO = { email: "demo@bailanysta.kz", password: "demo12345" };

export function LoginForm() {
  const params = useSearchParams();
  // Открытый редирект недопустим: принимаем только внутренние пути.
  const next = params.get("next");
  const redirectTo = next?.startsWith("/") && !next.startsWith("//") ? next : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = useLogin(redirectTo);

  const fields = login.error instanceof ApiRequestError ? login.error.fields : undefined;
  // Ошибка «неверная почта или пароль» не привязана к полю — показываем общей плашкой.
  const generalError = login.error && !fields ? login.error.message : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password });
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {generalError && (
        <p role="alert" className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {generalError}
        </p>
      )}

      <Field label="Почта" error={fields?.email}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Пароль" error={fields?.password}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="••••••••"
          />
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={login.isPending}>
        Войти
      </Button>

      <div className="flex items-center gap-3 text-[13px] text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        или
        <span className="h-px flex-1 bg-line" />
      </div>

      {/*
        Демо-вход дёргает тот же обычный /auth/login с seed-аккаунтом —
        никакого обходного пути в авторизации, просто заполненная форма.
      */}
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="w-full"
        disabled={login.isPending}
        onClick={() => {
          setEmail(DEMO.email);
          setPassword(DEMO.password);
          login.mutate(DEMO);
        }}
      >
        Войти как демо-пользователь
      </Button>

      <p className="text-center text-[13px] leading-snug text-ink-faint">
        Демо-аккаунт уже наполнен постами, подписками и уведомлениями.
      </p>
    </form>
  );
}
