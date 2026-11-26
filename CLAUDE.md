# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static AI education course website in Traditional Chinese, targeting retirees and non-technical learners. The live site is a set of hand-authored HTML pages in the repo root; the Markdown files are **content source only** (manually transcribed into the HTML — there is no build step or runtime Markdown parsing).

## Running the Site

No build step. Open directly or use a local server:

```bash
python -m http.server 8000
# then visit http://localhost:8000/
```

## Architecture

The site is 8 self-contained HTML pages in the root. Each page embeds its own `<style>` block (dark theme is the default) and loads two shared files: `theme.css` (light-mode override layer) and `theme.js` (theme toggle + accessibility helpers).

```
/                          # Live site (hand-authored HTML) + Markdown source
  index.html               # Landing page (hero, marquee, unit grid, timeline)
  unit1.html               # Unit 1 — AI 基礎知識 (fundamentals & history)
  unit2.html               # Unit 2 — AI 應用介紹 (tools & prompt engineering)
  unit3.html               # Unit 3 — ChatGPT/Gemini 實作 (largest page)
  unit4.html               # Unit 4 — 其他 AI 工具、Agent、影片生成
  unit5.html               # Unit 5 — 安全與未來 (ethics, privacy, governance)
  unit6.html               # Glossary — 名詞解釋 (term cards + search/modal)
  unit7.html               # Instructor bio — 講師介紹
  theme.css                # Shared light-mode overrides + a11y rules
  theme.js                 # Shared theme toggle, inline-color fixer, keyboard a11y
  01-..md ~ 07-..md        # Content SOURCE (mirror of the HTML; keep in sync)
  icon.png game.jpg prompt.png profile.jpg file01_T2V.mp4   # Assets
/.cursor/                  # Cursor AI workspace config & UI/UX skill data
```

> Note: the original `html5up-prologue` template has been fully superseded and removed — no HTML references it. When editing content, change the HTML (the live site) and mirror the change back into the matching `.md`.

## Detail popups (詳解彈窗)

Cards stay short; longer plain-language explanations live in a popup handled by `theme.js` (`initDetailCards`) and styled in `theme.css` (`#detailModal`, `.dm-*`).

```html
<div class="glass" data-detail data-detail-title="彈窗標題" data-detail-color="#3B82F6">
  …visible card content…
  <template class="detail-tpl">
    <p class="dm-plain">白話說明</p>
    <div class="dm-analogy">💡 生活化比喻</div>
    <div class="dm-example">📌 實際例子</div>      <!-- add .dm-ask → 「💬 你可以這樣問」 -->
    <div class="dm-you">🙋 對你的意義</div>
    <div class="dm-caution">⚠️ 注意</div>
    <ul class="dm-facts"><li><b>適合誰</b>…</li></ul>
  </template>
</div>
```

- `theme.js` auto-adds the「📖 看詳解 →」hint, `tabindex`/`role=button`, click + Enter/Space handling, Esc/backdrop close and focus return.
- Always set `data-detail-title` when the card has no `h3`/title element.
- Use classes only inside templates (no inline colors) so light mode works.
- unit3 limit cards keep their own `#limitModal`; their extra content goes in a hidden `<div class="limit-more" hidden>` inside each card.
- Popup content exists only in the HTML; do not mirror it into the `.md` files. Factual changes to visible content must still be mirrored.

## Content rules

- Audience: complete beginners and retirees. Explain jargon in plain words.
- Never write prices; describe free vs paid differences instead. Prefer brand names over version numbers.
- Verify time-sensitive facts (product availability, laws) before writing.

## Content Structure

Course units are sequential and build on each other: Theory (Unit 1) → Applications (Unit 2) → Practical tools (Units 3–4) → Ethics & future (Unit 5). Each unit/page uses headings, tables, cards and emoji for learner engagement, with a consistent dark-mode-first design.

## Tech Stack

- **Content:** Traditional Chinese, hardcoded in HTML (Markdown files are source mirrors)
- **Frontend:** HTML5 + Tailwind CSS (CDN) + inline/embedded CSS; Iconify icons; Google Fonts (Noto Sans TC + Space Grotesk); GSAP + ScrollTrigger for animation
- **Theming:** dark default via per-page `:root` variables; light mode via `theme.css` overrides + `theme.js` runtime inline-color fixer; preference stored in `localStorage` (`ai-course-theme`)
- **No backend, no database, no build toolchain**
- Deployed as static site via GitHub Pages from the `main` branch (root `/`) — pushing to `main` publishes to https://choe5.github.io/Web_AI_01/

## Cursor AI Integration

`.cursor/` contains a `ui-ux-pro-max` skill with CSV-driven design system data (colors, typography, stack templates for React/Vue/Next.js/Astro). Python scripts in that directory support design system queries and generation.
