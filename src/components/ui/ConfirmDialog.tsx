"use client";

import { Button } from "./Button";
import { Modal } from "./Modal";

/**
 * Подтверждение необратимого действия.
 *
 * Системный window.confirm() работает, но выпадает из оформления и не даёт
 * различить «удалить пост» и «удалить комментарий» ничем, кроме текста.
 */
export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Удалить",
  loading = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="text-[15px] leading-relaxed text-ink-muted">{description}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
