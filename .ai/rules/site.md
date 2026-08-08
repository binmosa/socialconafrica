---
paths:
  - 'resources/js/pages/site/**'
---

# Site

## Site pages: site/ prefix convention + server-localized DB content
Public site pages live in resources/js/pages/site/ — the 'site/' component prefix drives both the template-CSS conditional in app.blade.php (str_starts_with) and the null-layout case in app.tsx. Structured content (speakers, sponsors, agenda, awards, testimonials, tiers…) is DB-backed via spatie/laravel-translatable; controllers pass already-translated strings with getTranslation($field, app()->getLocale()) — never send raw translation JSON to React. Narrative/chrome copy stays in lang/{en,am,fr}/site.php via useT(); all three files must be updated in lockstep. Event dates/contact live in config/site.php only.
