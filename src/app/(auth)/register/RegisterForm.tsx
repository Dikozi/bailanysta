"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { useRegister } from "@/hooks/useAuth";
import { ApiRequestError } from "@/lib/api";
import { registerSchema } from "@/lib/validation";

export function RegisterForm() {
  const [form, setForm] = useState({ displayName: "", username: "", email: "", password: "" });
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});
  const register = useRegister();

  const serverErrors = register.error instanceof ApiRequestError ? register.error.fields : undefined;
  const errors = { ...localErrors, ...serverErrors };
  const generalError =
    register.error && !serverErrors ? register.error.message : null;

  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    // Сообщение об ошибке гасим сразу, как только человек начал править поле.
    setLocalErrors((current) => {
      if (!current[key]) return current;
      const { [key]: _removed, ...rest } = current;
      return rest;
    });
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();

    // Та же zod-схема, что и на сервере: правила не могут разойтись.
    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const found: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!(key in found)) found[key] = issue.message;
      }
      setLocalErrors(found);
      return;
    }

    setLocalErrors({});
    register.mutate(parsed.data);
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      {generalError && (
        <p role="alert" className="rounded-control bg-danger-soft px-3.5 py-2.5 text-sm text-danger">
          {generalError}
        </p>
      )}

      <Field label="Имя" error={errors.displayName}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            autoComplete="name"
            value={form.displayName}
            onChange={update("displayName")}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="Как вас называть"
          />
        )}
      </Field>

      <Field label="Ник" error={errors.username} hint="Латиница, цифры и подчёркивание">
        {({ id, describedBy, invalid }) => (
          <div className="relative">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-faint">
              @
            </span>
            <Input
              id={id}
              autoComplete="username"
              value={form.username}
              onChange={update("username")}
              aria-describedby={describedBy}
              aria-invalid={invalid}
              className="pl-7"
              placeholder="username"
            />
          </div>
        )}
      </Field>

      <Field label="Почта" error={errors.email}>
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={update("email")}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="you@example.com"
          />
        )}
      </Field>

      <Field label="Пароль" error={errors.password} hint="Минимум 8 символов">
        {({ id, describedBy, invalid }) => (
          <Input
            id={id}
            type="password"
            autoComplete="new-password"
            value={form.password}
            onChange={update("password")}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            placeholder="••••••••"
          />
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={register.isPending}>
        Создать аккаунт
      </Button>
    </form>
  );
}
