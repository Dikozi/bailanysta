import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { TelegramIcon } from "./brand";

export function TelegramButton({
  children = "Написать в Telegram",
  size = "md",
  className = "",
}: {
  children?: ReactNode;
  size?: "md" | "lg";
  className?: string;
}) {
  const sizing = size === "lg" ? "h-13 px-6 text-[16px] gap-2.5" : "h-11 px-5 text-[15px] gap-2";
  return (
    <a
      href={site.telegram.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group bg-sky text-sky-ink hover:bg-sky-hover inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap shadow-[0_8px_24px_-8px_rgb(42_170_254/0.5),inset_0_1px_0_rgb(255_255_255/0.45)] transition-[background-color,transform,box-shadow] duration-200 ease-out hover:shadow-[0_10px_30px_-8px_rgb(42_170_254/0.65),inset_0_1px_0_rgb(255_255_255/0.5)] active:scale-[0.98] ${sizing} ${className}`}
    >
      <TelegramIcon className={size === "lg" ? "size-5" : "size-[18px]"} />
      {children}
    </a>
  );
}

export function GhostLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={`border-line-strong text-fg hover:border-fg-3 inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-[15px] font-medium transition-colors duration-200 hover:bg-white/[0.03] ${className}`}
    >
      {children}
    </a>
  );
}

export function SectionHeading({
  title,
  lead,
  className = "",
  id,
}: {
  title: ReactNode;
  lead?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <h2 id={id} className="display text-fg text-[clamp(2rem,4.2vw,3.25rem)]">
        {title}
      </h2>
      {lead ? (
        <p className="text-fg-2 mt-4 text-[17px] leading-relaxed sm:text-lg">{lead}</p>
      ) : null}
    </div>
  );
}

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}
