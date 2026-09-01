"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { BIO_MAX_LENGTH, STATUS_MAX_LENGTH } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useLogout, useUpdateProfile } from "@/hooks/useAuth";
import { useCurrentUser } from "@/providers/SessionProvider";
import { useToast } from "@/providers/ToastProvider";
import { ApiRequestError } from "@/lib/api";

export function SettingsForm() {
  const user = useCurrentUser();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [status, setStatus] = useState(user?.status ?? "");
  const updateProfile = useUpdateProfile();
  const logout = useLogout();
  const { toast } = useToast();

  if (!user) return null;

  const fields =
    updateProfile.error instanceof ApiRequestError ? updateProfile.error.fields : undefined;

  const unchanged =
    displayName.trim() === user.displayName &&
    bio.trim() === (user.bio ?? "") &&
    status.trim() === (user.status ?? "");
  const bioLeft = BIO_MAX_LENGTH - bio.trim().length;
  const statusLeft = STATUS_MAX_LENGTH - status.trim().length;

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg">Профиль</h2>

        <div className="mb-5 flex items-center gap-4">
          <Avatar displayName={displayName || user.displayName} avatarColor={user.avatarColor} size="lg" />
          <div className="min-w-0 text-sm text-ink-muted">
            <p className="font-semibold text-ink">@{user.username}</p>
            {/* Ник и почта не меняются: ник — часть ссылки на профиль,
                смена почты требует подтверждения, которого в проекте нет. */}
            <p className="truncate">{user.email}</p>
            <p className="mt-1 text-[13px] text-ink-faint">
              Аватар собирается из инициалов — загрузка изображений не поддерживается.
            </p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            updateProfile.mutate(
              {
                displayName: displayName.trim(),
                bio: bio.trim() || null,
                status: status.trim() || null,
              },
              {
                onSuccess: () => toast("Профиль обновлён", "success"),
                onError: (error) => toast(error.message, "error"),
              },
            );
          }}
        >
          <Field label="Имя" error={fields?.displayName}>
            {({ id, describedBy, invalid }) => (
              <Input
                id={id}
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                aria-describedby={describedBy}
                aria-invalid={invalid}
              />
            )}
          </Field>

          <Field
            label="Статус"
            error={fields?.status}
            hint="Короткая строка под именем — например, чем вы сейчас заняты"
          >
            {({ id, describedBy, invalid }) => (
              <>
                <Input
                  id={id}
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  placeholder="Например: пишу диплом, отвечаю редко"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
                {statusLeft < 20 && (
                  <p
                    className={cn(
                      "mt-1 text-right text-[13px] tabular-nums",
                      statusLeft < 0 ? "text-danger" : "text-ink-faint",
                    )}
                  >
                    {statusLeft}
                  </p>
                )}
              </>
            )}
          </Field>

          <Field label="О себе" error={fields?.bio}>
            {({ id, describedBy, invalid }) => (
              <>
                <Textarea
                  id={id}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  rows={3}
                  placeholder="Пара строк о себе"
                  aria-describedby={describedBy}
                  aria-invalid={invalid}
                />
                <p
                  className={cn(
                    "mt-1 text-right text-[13px] tabular-nums",
                    bioLeft < 0 ? "text-danger" : "text-ink-faint",
                  )}
                >
                  {bioLeft}
                </p>
              </>
            )}
          </Field>

          <Button
            type="submit"
            loading={updateProfile.isPending}
            disabled={
              unchanged || displayName.trim().length === 0 || bioLeft < 0 || statusLeft < 0
            }
          >
            Сохранить
          </Button>
        </form>
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-lg">Оформление</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Выбор сохраняется между сессиями.</p>
        </div>
        <ThemeToggle />
      </Card>

      <Card className="flex items-center justify-between gap-4 p-5">
        <div>
          <h2 className="font-display text-lg">Аккаунт</h2>
          <p className="mt-0.5 text-sm text-ink-muted">Выйти из Bailanysta на этом устройстве.</p>
        </div>
        <Button variant="danger" loading={logout.isPending} onClick={() => logout.mutate()}>
          <LogOut className="size-4" />
          Выйти
        </Button>
      </Card>
    </div>
  );
}
