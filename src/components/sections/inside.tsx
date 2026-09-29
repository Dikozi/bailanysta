import { CalendarDays, Cloud, FolderOpen, ListChecks, Mic, Sheet } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { TelegramIcon } from "../brand";
import { Container, SectionHeading } from "../ui";

function Node({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon | typeof TelegramIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="border-line bg-ink-850 flex items-start gap-3 rounded-2xl border px-4 py-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
      <span className="text-fg-2 mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05]">
        <Icon className="size-[18px]" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-fg text-[15px] font-semibold">{title}</span>
        <span className="text-fg-2 text-[13.5px] leading-snug">{text}</span>
      </span>
    </div>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-3">{children}</div>;
}

function Connector() {
  return (
    <div aria-hidden className="flex items-center justify-center py-1 lg:py-0">
      <svg viewBox="0 0 48 16" className="text-sky/60 h-4 w-12 rotate-90 lg:rotate-0">
        <path d="M0 8h44m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

export function Inside() {
  return (
    <section
      aria-labelledby="inside-title"
      className="border-line bg-ink-900 border-t py-24 sm:py-32"
    >
      <Container>
        <SectionHeading
          id="inside-title"
          title="Что внутри"
          lead="Никаких новых приложений. Ассистент соединяет то, чем ты уже пользуешься: Telegram и сервисы Google."
        />

        <div className="mt-14 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4">
          <Column>
            <Node icon={TelegramIcon} title="Telegram" text="Текст, голосовые, файлы и фото" />
          </Column>
          <Connector />
          <Column>
            <div className="border-sky/30 bg-sky/[0.07] rounded-2xl border px-5 py-5">
              <p className="text-fg text-[17px] font-semibold">My Assist</p>
              <ul className="text-fg-2 mt-3 flex flex-col gap-2 text-[14px]">
                <li className="flex gap-2">
                  <Mic className="text-sky mt-0.5 size-4 shrink-0" aria-hidden />
                  Расшифровывает голосовые
                </li>
                <li className="flex gap-2">
                  <ListChecks className="text-sky mt-0.5 size-4 shrink-0" aria-hidden />
                  Находит дела, даты, сроки и повторы
                </li>
                <li className="flex gap-2">
                  <CalendarDays className="text-sky mt-0.5 size-4 shrink-0" aria-hidden />
                  Присылает план, напоминания и итоги
                </li>
                <li className="flex gap-2">
                  <Cloud className="text-sky mt-0.5 size-4 shrink-0" aria-hidden />
                  Работает 24/7
                </li>
              </ul>
            </div>
          </Column>
          <Connector />
          <Column>
            <Node
              icon={Sheet}
              title="Google Таблица"
              text="Все задачи — их можно открыть и поправить"
            />
            <Node icon={CalendarDays} title="Google Календарь" text="Дела с датой и временем" />
            <Node icon={FolderOpen} title="Google Диск" text="Файлы, фото и заметки" />
          </Column>
        </div>

        <div className="border-line text-fg-2 mt-16 grid gap-6 border-t pt-10 text-[15.5px] leading-relaxed md:grid-cols-2 md:gap-12">
          <p className="max-w-[60ch]">
            <span className="text-fg font-semibold">Бот отвечает только тебе.</span> Он работает в
            личном чате с одним владельцем — посторонним откажет.
          </p>
          <p className="max-w-[60ch]">
            <span className="text-fg font-semibold">Честно о данных.</span> Текст и голосовые
            разбирает ИИ Gemini, сообщения доставляет Telegram, а задачи, события и файлы хранятся в
            Google.
          </p>
        </div>
      </Container>
    </section>
  );
}
