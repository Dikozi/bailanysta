import { Plus } from "lucide-react";
import { site } from "@/lib/site";
import { Container, SectionHeading } from "../ui";

const FAQ: { q: string; a: string }[] = [
  {
    q: "Нужно что-то устанавливать?",
    a: "Отдельного приложения нет — ассистент живёт в Telegram. Для календаря, таблицы задач и файлов нужен Google-аккаунт.",
  },
  {
    q: "Он правда понимает голосовые?",
    a: "Да. Бот расшифровывает голосовое, показывает текст и разбирает его как обычное сообщение. Расшифровку видно сразу, так что результат легко проверить.",
  },
  {
    q: "Напомнит точно вовремя?",
    a: "Бот проверяет расписание каждые пять минут и присылает напоминания за 30 и за 10 минут до начала. Чтобы видеть их на часах, включи на них уведомления Telegram.",
  },
  {
    q: "А если он понял не так?",
    a: "После сохранения есть кнопка «Отменить», после отметки или переноса — кнопка возврата. Если в сообщении есть время, но непонятно, что сделать, бот переспросит.",
  },
  {
    q: "Где хранятся мои задачи?",
    a: "Задачи — в Google Таблице, события — в Google Календаре, файлы и заметки — на Google Диске. Текст сообщений и голосовые обрабатывает ИИ Gemini, доставляет сообщения Telegram.",
  },
  {
    q: "На каком языке он общается?",
    a: "По-русски, на «ты» — коротко и по делу.",
  },
  {
    q: "Можно поменять время утреннего плана?",
    a: "Да, командой /settings: время утреннего сообщения, вечерней сверки и часовой пояс.",
  },
  {
    q: "Что будет после недели поддержки?",
    a: `Ассистент продолжает работать так, как настроен. Новые доработки — за отдельную плату, обсуждаем в Telegram ${site.telegram.handle}.`,
  },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="border-line border-t py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
        <SectionHeading
          id="faq-title"
          title="Вопросы"
          lead="Коротко о том, что обычно спрашивают."
        />
        <div className="border-line border-t">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-line border-b">
              <summary className="text-fg flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] font-medium transition-colors duration-150 hover:text-white [&::-webkit-details-marker]:hidden">
                {item.q}
                <Plus
                  className="text-fg-3 size-5 shrink-0 transition-transform duration-300 ease-[var(--ease-out-expo)] group-open:rotate-45"
                  aria-hidden
                />
              </summary>
              <p className="text-fg-2 max-w-[62ch] pb-6 text-[15.5px] leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
