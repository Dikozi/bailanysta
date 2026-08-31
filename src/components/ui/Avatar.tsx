import { cn } from "@/lib/cn";

/**
 * Загрузки картинок в проекте нет — вместо аватара инициалы на плашке.
 * Цвет детерминирован ником, поэтому один и тот же человек всегда одного
 * цвета: узнаваемость почти как у фото, но без хранилища и модерации.
 */
const COLORS: Record<string, string> = {
  amber: "bg-[#F2C14E] text-[#3D2A00]",
  rose: "bg-[#E8879B] text-[#3D0A17]",
  violet: "bg-[#A692E0] text-[#241046]",
  sky: "bg-[#7FB4E3] text-[#0B2740]",
  emerald: "bg-[#6FC5A0] text-[#04301F]",
  orange: "bg-[#EF9F70] text-[#401C00]",
  cyan: "bg-[#6FC7C7] text-[#023436]",
  fuchsia: "bg-[#D68CD0] text-[#3D0B39]",
};

const SIZES = {
  sm: "size-8 text-[12px]",
  md: "size-10 text-sm",
  lg: "size-14 text-lg",
  xl: "size-20 text-2xl",
} as const;

/** Берём первые буквы имени и фамилии: «Айжан Сериккызы» → «АС». */
function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("ru");
  return (parts[0][0] + parts[1][0]).toLocaleUpperCase("ru");
}

export function Avatar({
  displayName,
  avatarColor,
  size = "md",
  className,
}: {
  displayName: string;
  avatarColor: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      // Имя уже написано рядом текстом, поэтому для скринридера аватар — декор.
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-bold",
        COLORS[avatarColor] ?? COLORS.violet,
        SIZES[size],
        className,
      )}
    >
      {initials(displayName)}
    </span>
  );
}
