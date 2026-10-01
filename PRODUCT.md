# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) + Tailwind CSS 4, TypeScript. Deploy target: Vercel. Chosen by the owner.

## Users

Primary buyer: busy specialists and entrepreneurs — many calls, deadlines and small errands held in their head, who already live in Telegram and Google Calendar. They buy a personally configured assistant, not a self-serve app. Site language: Russian only, informal «ты».

## Product Purpose

My Assist is a personal AI planner inside the client's own Telegram bot. The client writes or dictates tasks in plain words; the bot parses one or several tasks, saves them to a Google Sheet, creates Google Calendar events for dated tasks, sends reminders in Telegram, a morning plan, an evening check-in and weekly/monthly summaries. The business is a done-for-you setup service: the owner builds and configures the bot for each client. Success for the site: a qualified visitor messages the owner in Telegram.

## Positioning

A closed loop in one Telegram chat: phrase or voice → task → Google Calendar event → reminder → mark done → summary. Installed personally for the client, running on the client's Google account (Sheet, Drive, Calendar). Do not claim superiority over ChatGPT, Gemini or any competitor — no comparative research exists.

## Operating Context

- Input: Telegram text, voice messages, audio, files/photos (saved to Google Drive); optional iPhone Shortcut dictation (Siri / Action button) that posts to the bot.
- Scheduled messages: morning plan ~08:00 (considers Google Calendar events), reminders 30 and 10 minutes before timed tasks (5-minute scheduler, not minute-exact), evening check-in ~21:00 with "move the rest to tomorrow", weekly review on Sunday, monthly review on the 1st.
- Natural-language actions: "сделал отчёт", "перенеси стоматолога на понедельник", "удали задачу", "что у меня сегодня?".
- Recurring tasks and habits (daily, weekdays, chosen days, every N days, monthly, with an end), streaks from recorded marks.
- Undo for saving and some actions; overdue list with Today / Tomorrow / Done / Delete buttons.
- Runs on Google Apps Script + Gemini; works while the client's computer is off.
- If Gemini is overloaded or out of quota, the bot says it saved the message and retries it later from a queue (up to six hours, certain error types only). Never claim "nothing is ever lost".

## Capabilities and Constraints

- Russian language only is confirmed. Default timezone Asia/Almaty (changeable).
- One owner per bot (private chat).
- Data leaves the account for processing: message text and audio go to Gemini; Telegram delivers messages. Never claim "data never leaves your account", "never logs", or end-to-end encryption.
- Never claim: exact-minute reminders, 100% voice accuracy, "any action can be undone", "nothing is ever lost", "does the tasks for you", measured time savings.
- No web dashboard, no native app, no WhatsApp, no team features.

### Pricing (confirmed by owner)

- Setup: 35 000 ₸; prepayment 15 000 ₸.
- Includes 1 week of support and adjustments after launch.
- No subscription: the client pays once; no monthly fee (confirmed by owner).
- Setup takes 2 days after prepayment (confirmed by owner).
- Further changes after that week are paid separately by the client.
- Whose accounts host the bot: undecided — do not state.

### CTA

Primary: Telegram contact of the owner — https://t.me/diaskadyrbekov. Secondary (unconfirmed live): Instagram my_assist.app.

## Brand Commitments

- Name: My Assist (spelling fixed). Legal entity: undecided — do not publish.
- Voice (from the bot's system prompts): short, on «ты», calm and concrete, warm without flattery, no bureaucratic language, no invented numbers.
- Campaign slogan: «Меньше держать в голове. Больше успевать.»
- Standing visual preference (chosen by owner over a bolder rolled direction): the category-standard AI-product landing, played straight — dark ground, live product demonstrations, restrained accents — at the craft level of Linear, Raycast and Superhuman.
- Logo: approved by the owner — monogram "MA" (blue #2AAAFE M, white A) on deep navy, wordmark "My Assist". Source raster: public/brand/my-assist-logo.webp (owner-provided); vector mark traced from it in src/components/logo-mark.tsx. The logo blue is the site accent.

## Evidence on Hand

- No real screenshots, videos, testimonials, user counts, metrics, partners or press. Do not fabricate any of them.
- Ten campaign illustrations and eight logo concepts exist on the owner's machine (not in this repo); they are drawn mockups, not product screenshots.
- Verbatim bot message templates confirmed by the owner's brief (source: bot code `Code.gs`): «✅ Сохранил: …», «✅ Отметил: …», «📅 Перенёс: … → …», «🗑 Удалил: …», «⏰ Через 10 мин», «Уже занялся „…“? Отметь, когда закончишь.», «📝 Записал на Диск: …», «🤔 Какую задачу перенести?»; buttons «↩️ Отменить», «↩️ Не сделано», «✅ Готово», «⏭ Завтра», «🗑 Удалить», «🌙 Остальное перенести на завтра».
- Demonstrations on the site must be clearly illustrative (reconstructed chat flows built from real bot message templates such as «✅ Сохранил: …», «⏰ Через 10 мин», «Уже занялся „…“? Отметь, когда закончишь.»).

## Product Principles

1. Show the mechanism, not a promise: a sentence becoming a task, an event and a reminder.
2. Every claim must be true of the shipped bot; undecided facts stay off the page.
3. It is a personal service — a human sets it up for you; make that tangible.
4. Respect the visitor's time the way the bot respects the user's: short, concrete, «ты».

## Accessibility & Inclusion

WCAG 2.2 AA contrast, full keyboard access, prefers-reduced-motion respected, legible on small phones (most traffic expected from Instagram/Telegram on mobile).
