---
paths:
  - 'resources/js/**'
---

# Js

## Pure Tailwind v4 + shadcn; committed "daylight festival" appearance
The voter UI is pure Tailwind v4 + shadcn (`components/ui/*`) with a single committed LIGHT look — shadcn tokens are mapped identically on `:root` and `.dark`; do not build dark-mode variants. Brand tokens live in `resources/css/app.css` `@theme`: `paper`/`paper-soft` (warm ivory grounds), `ink` (deep indigo text), `veil` (violet tint), `mist` (muted text), `gold` (readable amber — text/icons only), `gold-fill` (bright gold — fills/borders/CTAs with ink text), `gold-soft` (deep amber emphasis text), `ember`, `violet`, `pink`. Never use `text-gold-fill` for small text (contrast). Signature utilities: `tally-underline` (gold ballot stroke), `bg-spotlight`/`text-spotlight` (violet→pink→gold gradient: avatar story rings, top-3 rank chips, progress bars, one gradient-border card per page max), `shadow-lift` (indigo-tinted elevation). `app.blade.php` pins first-paint background to `#fbf7f0`. Nominee avatars always render through `NomineeAvatar` (story ring built in). NOTE: a "street poster" restyle (hard ink borders, stamp shadows, sticker rotations) was tried and explicitly rejected by the stakeholder as childish — do not reintroduce that language.

## Layout + routing conventions
`app.tsx` wraps every page with `layouts/voter-layout.tsx` via the Inertia v3 `layout: () => VoterLayout` resolver — pages do not set their own layout. All voter routes are locale-prefixed (`/{locale}/...`, en/am); build links with Wayfinder helpers from `@/routes` passing `locale` from `useT()` (e.g. `nomineesIndex(locale).url`) — never hardcode URL strings. Shared props are typed in `resources/js/types/index.ts` (`SharedData`) and `types/global.d.ts`; update both together when `HandleInertiaRequests` changes.
