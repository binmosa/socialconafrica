---
paths:
  - 'resources/js/**'
---

# Js

## Nexus template CSS loads in app.blade.php, overrides in resources/css/template.css
The 9 Nexus template stylesheets (public/template/css/, main.css last) are rendered server-side in app.blade.php for site pages only — never inject them via Inertia <Head> (post-mount, unstyled first paint). All port fixes/preflight repairs live in resources/css/template.css, which Vite loads after main.css so its rules win. Template CSS is descendant-scoped: carousels need their wrapper classes (.team-widget-slider, .brand-slider-area, .works-slider-area) or card/hover styles die. Never use the template classes `reveal` or `text-anime-style-*` in React (GSAP-only; elements stay invisible).
