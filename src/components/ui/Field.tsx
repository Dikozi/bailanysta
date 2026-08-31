"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/cn";

const CONTROL_BASE =
  "w-full rounded-control border bg-surface px-3.5 text-[15px] text-ink placeholder:text-ink-faint " +
  "transition-colors focus:border-accent focus-visible:outline-none disabled:opacity-60";

type FieldWrapperProps = {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; describedBy?: string; invalid: boolean }) => React.ReactNode;
};

/**
 * Обёртка связывает подпись, поле и текст ошибки через aria-*.
 * Без этого скринридер читает «поле ввода» без намёка, что именно не так.
 */
export function Field({ label, error, hint, children }: FieldWrapperProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink-muted">
        {label}
      </label>
      {children({ id, describedBy: message ? messageId : undefined, invalid: Boolean(error) })}
      {message && (
        <p
          id={messageId}
          className={cn("text-[13px]", error ? "text-danger" : "text-ink-faint")}
          role={error ? "alert" : undefined}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cn(CONTROL_BASE, "h-11", className)} {...rest} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={cn(CONTROL_BASE, "resize-none py-2.5", className)} {...rest} />;
});
