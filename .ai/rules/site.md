---
paths:
  - 'resources/js/pages/**'
---

# Pages

## Server-localized DB content + en/am lang lockstep
Structured catalog content (categories, nominees) is DB-backed via spatie/laravel-translatable; controllers pass already-translated strings with `getTranslation($field, app()->getLocale())` — never send raw translation JSON to React. Nominee `display_name`/`handle` are never translated (spec rule). Narrative/chrome copy lives in `lang/{en,am}/site.php`, consumed through `useT()` dot-paths with `:placeholder` interpolation; **both locale files must be updated in lockstep** — a key added to one must be added to the other in the same change.

## Voter-flow state must survive every redirect
Critical UX rule from the spec: never lose nominee/vote-quantity context. Checkout state rides in the URL query (`?qty=`, `?category=`); auth redirects stash `session('vote.intent')` and return via `PostLoginRedirector`; the payment return page relies only on the order row. Locale switching (`LocaleController@switch`) preserves path and query string — keep it that way.
