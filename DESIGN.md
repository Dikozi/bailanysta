---
name: My Assist
description: Personal AI planner in Telegram — a dark, product-first landing where the bot is shown working, not described.
colors:
  ink-950: "#04060d"
  ink-900: "#070b17"
  ink-850: "#0a1020"
  ink-700: "#151e38"
  ink-600: "#1f2a4a"
  fg: "#eef2ff"
  fg-2: "#aab4d0"
  fg-3: "#7d88a8"
  line: "rgb(160 180 255 / 0.1)"
  line-strong: "rgb(160 180 255 / 0.18)"
  sky: "#2aaafe"
  sky-hover: "#5ec0ff"
  sky-deep: "#2f7de1"
  sky-ink: "#031126"
  mint: "#43e0a3"
  tg-bg: "#0e1621"
  tg-head: "#17212b"
  tg-in: "#182533"
  tg-out: "#2b5278"
  tg-btn: "#22303f"
  tg-text: "#f5f7fa"
typography:
  display:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.6rem, 7vw, 3.7rem)"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: "-0.035em"
    fontFeature: "\"ss01\", \"cv11\""
  headline:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.2vw, 3.25rem)"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  numeral:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 4.5rem)"
    fontWeight: 620
    lineHeight: 1.02
    letterSpacing: "-0.035em"
    fontFeature: "\"tnum\""
  title:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  chat:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Onest Variable, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono Variable, ui-monospace, SF Mono, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "\"tnum\""
rounded:
  pill: "9999px"
  tile: "24px"
  window: "16px"
  inset: "12px"
  key: "8px"
  tail: "6px"
spacing:
  gutter-mobile: "16px"
  gutter-tablet: "24px"
  gutter-desktop: "32px"
  grid-gap: "16px"
  heading-to-content: "56px"
  section-y: "96px"
  section-y-wide: "128px"
  container: "1200px"
components:
  button-primary:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.sky-ink}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  button-primary-lg:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.sky-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.sky-hover}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "44px"
  chip-scenario:
    backgroundColor: "transparent"
    textColor: "{colors.fg-2}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  feature-tile:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.fg}"
    rounded: "{rounded.tile}"
    padding: "28px"
  chat-window:
    backgroundColor: "{colors.tg-bg}"
    textColor: "{colors.tg-text}"
    rounded: "{rounded.window}"
  bubble-in:
    backgroundColor: "{colors.tg-in}"
    textColor: "{colors.tg-text}"
    typography: "{typography.chat}"
    rounded: "{rounded.window}"
    padding: "8px 12px"
  bubble-out:
    backgroundColor: "{colors.tg-out}"
    textColor: "{colors.tg-text}"
    typography: "{typography.chat}"
    rounded: "{rounded.window}"
    padding: "8px 12px"
  inline-key:
    backgroundColor: "{colors.tg-btn}"
    textColor: "{colors.tg-text}"
    rounded: "{rounded.key}"
    padding: "6px 4px"
  node-card:
    backgroundColor: "{colors.ink-850}"
    textColor: "{colors.fg}"
    rounded: "{rounded.window}"
    padding: "14px 16px"
---

# Design System: My Assist

## Overview

**Creative North Star: "Cool Ink, Real Chat"**

The page is the category-standard dark AI-product landing, played straight at Linear / Raycast / Superhuman finish. Its whole argument is carried by product UI rendered in real HTML: Telegram-dark chat windows, bubbles with inline keyboards, a day-column Google Calendar and a notification toast. The marketing layer around them is quiet on purpose, so the chat is the loudest thing on every screen.

The ground is a cold navy-black ink, stacked in a few tonal steps and separated by low-alpha blue hairlines rather than shadows. One sky-blue accent means "act" (the Telegram CTA) and "the assistant" (its mark, the landed event, the timeline). Mint means "done" and nothing else. Type is a single variable grotesque, Onest, set tight and heavy for display, with JetBrains Mono carrying times, commands and the handle.

Density is calm: generous section rhythm (96/128px), a 1200px container, bento tiles and a sticky-left / scrolling-right split for the long sections. Motion is short and exponential-out, and every animation has a reduced-motion path.

**Key Characteristics:**
- Cool ink ground (ink-950) with tonal layers (ink-900, ink-850) and hairline borders.
- One accent, sky; mint is a state, not a second accent.
- Product surfaces use their own Telegram-dark palette, never the page palette.
- Onest for everything, tight negative tracking on display; mono only for times and handles.
- Pills for actions, large soft corners (24px) for containers, 16px for chat windows.
- Depth from tone and hairlines; real shadows are reserved for floating product UI.

## Colors

A cold, near-monochrome ink field with a single sky-blue voice and a mint "done" state.

### Primary
- **Telegram Sky** (sky): the only accent. Primary CTA fill, the logo mark, the assistant's timeline dots and scroll-filled rail, the landed calendar event tint, the active scenario chip border, focus rings and check badges in the price list. Hovers lift to **Sky Hover** (sky-hover).
- **Deep Sky** (sky-deep): never a fill for UI. It is the colour of the soft radial glows (at 0.18–0.22 alpha) behind the hero demo, the price card and the closing CTA, and the stroke of the logo check inside the bot avatar.
- **Sky Ink** (sky-ink): text and icon colour on sky fills.

### Tertiary
- **Done Mint** (mint): exclusively the completed state: a finished calendar event (15% fill, 40% ring), done days in the habit strip. Never decorative, never a CTA.

### Neutral
- **Ink 950** (ink-950): page ground, header glass base (80% alpha), theme colour.
- **Ink 900** (ink-900): raised section band ("Что внутри") and tile/price-card surfaces.
- **Ink 850** (ink-850): secondary cards: integration nodes, calendar panel.
- **Ink 700** (ink-700): pre-existing calendar events (at 70%).
- **Ink 600** (ink-600): scrollbar thumb.
- **Frost** (fg): headings and primary text.
- **Mist** (fg-2): body, leads, the second line of the hero headline, nav links.
- **Dusk** (fg-3): captions, demo disclaimers, secondary meta, calendar hour labels.
- **Hairline** (line) / **Hairline Strong** (line-strong): every border and divider; strong for ghost-button and chip hover borders.

### Telegram Palette (product surfaces only)
- **Chat Ground** (tg-bg), **Chat Header** (tg-head), **Incoming Bubble** (tg-in), **Outgoing Bubble** (tg-out), **Inline Key** (tg-btn), **Chat Text** (tg-text): the Telegram dark theme, used only inside chat windows, feature-tile demo wells and timeline chat cards.

### Named Rules
**The One Voice Rule.** Sky is the only accent. If something is sky, it is either an action or the assistant itself.

**The Mint Means Done Rule.** Mint appears only when a task or day is completed.

**The Two Palettes Rule.** Page chrome uses ink/fg/line; anything that depicts Telegram uses the tg palette. Do not paint product mockups with page tokens or page chrome with tg tokens.

## Typography

**Display Font:** Onest Variable (with ui-sans-serif, system-ui)
**Body Font:** Onest Variable
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace, SF Mono)

**Character:** One confident Cyrillic-strong grotesque does all the talking, set heavy (620) and tight (-0.035em) at display size so headlines read as blocks; the mono is a precise instrument for clock times, step numbers and the Telegram handle. Body text carries stylistic sets ss01 and cv11 site-wide.

### Hierarchy
- **Display** (620, clamp(2.6rem, 7vw, 3.7rem), 1.02): the hero headline only. The second sentence drops to Mist (fg-2) instead of changing weight or size.
- **Headline** (620, clamp(2rem, 4.2vw, 3.25rem), 1.02): section H2s, max width about 42rem; the closing CTA runs slightly larger (clamp(2.2rem, 5vw, 3.75rem)).
- **Numeral** (620, clamp(3rem, 7vw, 4.5rem), tabular): the price.
- **Title** (600, 19–20px, -0.015 to -0.02em): tile, step and timeline headings.
- **Lead** (400, 17px rising to 18–19px at sm, 1.625): section leads and the hero subline, in Mist.
- **Body** (400, 15–15.5px, 1.625): tile copy, FAQ answers (max 62ch), notes.
- **Chat** (400, 14px, 1.45): bubble text; bubble timestamps 11px tabular.
- **Label** (500, 13–14px): nav, chips, captions and demo disclaimers (13px, Dusk).
- **Mono** (400, 13px, tabular): timeline times (in sky), step numbers, the handle; 10–10.5px for calendar hours.

### Named Rules
**The Tabular Numbers Rule.** Every price, time and count is set with tabular numerals.

**The Mono For Clocks Rule.** Mono is for machine-exact strings (times, commands, handles, step numbers), never for prose or headings.

## Layout

A centred 1200px container with 16 / 24 / 32px gutters (mobile / sm / lg). Sections stack with a top hairline and 96px vertical padding, 128px from sm; the closing CTA gets 112/144px. Section heading to content is 56px. Bento grids run on 12 columns at lg (7+5 / 5+7 / 6+6) with a 16px gap. Long narrative sections (the day timeline, FAQ) use a 5:7 split with the heading column sticky at 112px from the top. The hero is an 11:13 two-column split at lg with the live demo on the right; on mobile, text and buttons come first and the demo directly follows. The header is a 64px sticky glass bar; anchor scrolling offsets by 80px.

## Elevation & Depth

Hybrid, weighted to tone. The marketing layer is flat: depth comes from stepping ink-950 → ink-900 → ink-850 and from hairlines, with an optional 1px inner top highlight on raised cards. Real drop shadows exist only on things that "float" as product UI (the chat window and the reminder toast) and as a coloured glow under the primary CTA. Large, very soft radial glows in deep sky sit behind the hero demo, the price card and the closing CTA; they are light, not objects.

### Shadow Vocabulary
- **CTA Glow** (`box-shadow: 0 8px 24px -8px rgb(108 180 255 / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.45)`): the primary button; on hover `0 10px 30px -8px rgb(108 180 255 / 0.7), inset 0 1px 0 rgb(255 255 255 / 0.5)`.
- **Window Lift** (`box-shadow: 0 30px 80px -20px rgb(0 0 0 / 0.7), 0 2px 6px rgb(0 0 0 / 0.4)`): the chat window.
- **Toast Lift** (`box-shadow: 0 18px 40px -12px rgb(0 0 0 / 0.8)`): the notification toast, with 12px backdrop blur.
- **Top Highlight** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.05)`): feature tiles (0.04 on integration nodes).

### Named Rules
**The Product Floats Rule.** Only depicted product UI casts a shadow. Page cards stay flat and are separated by tone and hairlines.

## Shapes

Soft and consistent. Actions, chips, avatars, icon buttons and step counters are full pills or circles. Containers use large soft corners: 24px for tiles and the price cards, 16px for chat windows, bubbles, nodes and toasts, 8px for calendar events and inline keyboard keys. Telegram bubbles keep their tail: the corner on the sender's side tightens to 6px (bottom-right for outgoing, bottom-left for incoming). Borders are 1px hairlines; dashed hairline only for the empty reminder placeholder on mobile.

## Components

### Buttons
Round, bright and singular: there is one kind of primary action, and it opens Telegram.
- **Shape:** full pill (9999px).
- **Primary:** Telegram Sky fill, Sky Ink text, 600 weight, Telegram glyph leading. 44px tall with 20px sides at 15px text; large variant 52px tall with 24px sides at 16px text. Carries the CTA Glow.
- **Hover / Focus:** fill lifts to Sky Hover and the glow grows; press scales to 0.98; 200ms ease-out. Focus everywhere is a 2px sky outline at 3px offset.
- **Ghost:** transparent with a Hairline Strong border, Frost text, 500 weight; hover brightens the border to Dusk and adds a 3% white wash.
- **Header CTA:** compact 36px pill on a 6% white wash with a Hairline Strong ring and a sky Telegram glyph.

### Chips
- **Style:** scenario chips under the hero demo; pill, 13px/500, 6px × 14px, Hairline border, Mist text.
- **State:** active chip gets a 40% sky border, 10% sky wash and Frost text, plus a 1px sky progress line along its bottom edge that fills during autoplay.

### Cards / Containers
- **Corner Style:** 24px for feature tiles and price cards; 16px for nodes.
- **Background:** ink-900 tiles; ink-850 nodes; the featured price card adds a 25% sky border and its own radial glow; the "My Assist" hub node uses a 30% sky border on a 7% sky wash.
- **Shadow Strategy:** flat, Top Highlight only (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 24px (28px from sm) for tile text; 28px / 36px for price cards. Feature tiles end in a Chat Ground well separated by a 5% white top border, where the product demo sits.

### Navigation
- **Style:** 64px sticky bar, ink-950 at 80% with 24px backdrop blur and saturate(150%), bottom hairline. Wordmark left, 14px Mist links with 28px gaps that turn Frost on hover (150ms), compact Telegram pill right. Links hide below md; the wordmark and CTA remain.

### Telegram Chat (signature)
The chat is the product and is drawn faithfully: header with a sky-gradient bot avatar and a status line ("бот" / "печатает…"), incoming and outgoing bubbles with tails, tabular timestamps, read ticks, voice messages with a waveform, a three-dot typing indicator, and inline keyboards as 8px keys in Inline Key colour at 12.5px/500. Bot message text is the bot's real templates, emoji included. New messages enter with a 520ms fade, rise and 2px blur on ease-out-expo.

### Calendar Day and Reminder Toast (signature)
A narrow ink-850 panel headed with the day and "Google Календарь", hour rows as hairlines with mono hour labels. The event that the chat creates lands with a 640ms clip-path reveal in a 20% sky wash with a 45% sky ring, and turns mint when marked done. The reminder toast floats over the demo corner on desktop (in its own reserved slot on mobile) with the Toast Lift.

### Day Timeline (signature)
A vertical 1px hairline rail with a sky overlay that fills as it scrolls into view (scroll-driven animation where supported, static otherwise). Each moment has a sky dot ringed in ink, a sky mono time, a title, a note, and a chat card on Chat Ground.

### FAQ
Native disclosure rows between hairlines, 17px/500 questions, a Dusk plus that rotates 45° on open (300ms, ease-out-expo), answers in Mist at 15.5px, max 62ch.

## Do's and Don'ts

### Do:
- **Do** show capability through rendered Telegram and Calendar UI in the tg palette, labelled as a demonstration in a 13px Dusk caption.
- **Do** keep sky for actions and the assistant, and mint strictly for completed states.
- **Do** separate page surfaces with ink tone steps and Hairline borders; open each section with a top hairline.
- **Do** set headlines in Onest at 620 with -0.035em tracking and 1.02 line-height; dim a second clause to Mist rather than changing its size.
- **Do** use tabular numerals for prices and times, and mono for clock times, step numbers and handles.
- **Do** animate with ease-out-expo (cubic-bezier(0.16, 1, 0.3, 1)), 150–200ms for state changes and 500–650ms for entrances, and collapse all motion under prefers-reduced-motion.

### Don't:
- **Don't** introduce a second accent colour in page chrome; decorative mint, violet or warm fills break the One Voice Rule (third-party UI depicted inside a demo, such as the iOS Shortcuts tile, keeps its own colours).
- **Don't** cast drop shadows from page cards; shadows belong to floating product UI and the primary CTA glow.
- **Don't** replace rendered product UI with static phone screenshots or generic icon-card grids.
- **Don't** use emoji outside depicted bot messages and inline keyboards; page chrome uses SVG icons (Lucide, 1.5–2px stroke, or the brand glyphs).
- **Don't** put small uppercase labels or kickers above headlines; headings stand alone.
- **Don't** use mono for prose, headings or buttons.
