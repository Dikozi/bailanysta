import { AppShell } from "@/components/layout/AppShell";

/** Все основные экраны живут внутри общей оболочки с навигацией. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
