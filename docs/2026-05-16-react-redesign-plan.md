# React redesign — implementation plan

**Date:** 2026-05-16
**Author:** planning session w/ Claude
**Scope:** land the editorial-sport React/JSX redesign (PACE.) over the existing vanilla-JS site

---

## Overview

The repo currently ships a vanilla-JS calculator site (`index.html`, `js/{app,calculators,ui,storage,analytics,engagement}.js`, `css/{styles,animations,engagement}.css`, plus per-distance sibling pages). The proposed redesign is a React 18 / JSX rewrite with an editorial-sport aesthetic, a single goal-driven workspace, six standalone tools, and Marathon / VO₂ Max / Guide / Contact pages.

The redesign exists only as draft JSX (`app.jsx`, `home.jsx`, `tools.jsx`, `pages.jsx`, `tweaks-panel.jsx`, `calc.js`, a new `styles.css`, and a new `index.html` that loads React + Babel from a CDN). None of those files are on disk in this repo.

This plan lands the redesign in three phases. Decisions already made:

- **Migration shape:** replace in place. Move the vanilla site to `legacy/` behind a redirect; new redesign is the new `/`.
- **Build:** Vite + React. Real ES modules, compiled JSX, fast HMR, small production bundle.

## Desired end state

- Vercel-deployed React site served from `/`, vanilla site preserved at `/legacy/` for one release cycle then deleted.
- All formerly-mojibaked glyphs (em-dash, en-dash, middle-dot, arrow, subscript 2) render correctly across every page and component.
- Tweaks (theme, accent, units) persist across reloads via `localStorage` — the prototyping-host `__edit_mode_set_keys` channel is retained but no longer the only source of truth.
- Calculator math (`calc.js`) is unchanged but has unit-test coverage on Vitest, including the negative-split math currently bugged in the Marathon page.
- Lighthouse: Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95, PWA installable.
- Contact form sends real email via a Vercel serverless function or Formspree.

## What we're NOT doing

- Not changing the visual brand (typography, palette, layout proportions stay as drafted).
- Not rewriting the calculation engine. VDOT, Riegel, Karvonen, MET formulas are correct and stay.
- Not adding user accounts, server-side persistence, or a backend beyond a single contact endpoint.
- Not adding new calculators. The six in the draft are the scope.
- Not migrating to Next.js. Vite/React stays a client-side SPA. (If SEO performance turns out to be inadequate after Phase 2, revisit.)
- Not keeping the vanilla codebase indefinitely. `legacy/` is a one-release escape hatch, then gone.

---

## Phase 1 — Land the redesign cleanly

### Overview

Stand up the Vite/React project, fix the mojibake, port the JSX files in as real modules, persist tweaks, and fix the visible bugs in the draft. The vanilla site moves to `legacy/` with a top-level redirect. By end of phase, the redesign is functionally complete on a Vercel preview URL.

### Changes required

#### 1. Move the vanilla site to `legacy/`

**Action:** `git mv` the live files into a new `legacy/` subfolder.

Files moved:
- `index.html`, `vo2-max-calculator.html`, `marathon-pace-calculator.html`, `contact.html`, `privacy-policy.html`, `terms-of-use.html`
- `js/`, `css/`, `assets/`
- `robots.txt`, `sitemap.xml`, `ads.txt` (these need to live at the root after the new site is up — re-add at root in Phase 2)

Add `legacy/README.md` noting this is the pre-redesign site preserved for one release cycle.

#### 2. Initialize Vite + React project at the repo root

**Action:** scaffold `npm create vite@latest . -- --template react` (manually merge into existing `package.json`).

New files:
- `package.json` — add `react`, `react-dom`, `vite`, `@vitejs/plugin-react`. Keep `@vercel/analytics`. Add scripts: `dev`, `build`, `preview`, `lint`, `test`.
- `vite.config.js` — React plugin, base `/`.
- `index.html` — minimal Vite entry; mounts `<div id="root">`, imports `/src/main.jsx`.
- `.gitignore` — add `dist/`, `.vite/`.
- `.nvmrc` — pin Node 24 LTS (Vercel default).

#### 3. Port JSX files into `src/` as real modules

**Files to create from the attached drafts (mojibake fixed):**

- `src/main.jsx` — `ReactDOM.createRoot(...).render(<App />)`.
- `src/App.jsx` — from draft `app.jsx`. Remove `useStateA`/`useEffectA` aliases, use real `import { useState, useEffect } from 'react'`. Remove the `TWEAK_DEFAULTS` `/*EDITMODE-BEGIN*/.../*EDITMODE-END*/` markers (host-specific, not needed in production).
- `src/home/Workspace.jsx`, `src/home/Dashboard.jsx`, `src/home/PaceChart.jsx`, `src/home/PaceRows.jsx`, `src/home/Splits.jsx`, `src/home/HRZonesCard.jsx`, `src/home/RacePredictions.jsx`, `src/home/VDOTHero.jsx`, `src/home/RaceCard.jsx` — split from `home.jsx`. (Or keep as one file if the team prefers.)
- `src/tools/ToolsSection.jsx`, plus one file per tool component (or keep `tools.jsx` as one file).
- `src/pages/MarathonPage.jsx`, `src/pages/VO2Page.jsx`, `src/pages/ContactPage.jsx`, `src/pages/GuidePage.jsx` — split from `pages.jsx`.
- `src/lib/calc.js` — port from draft. Convert from `window.Calc = (function() { ... })()` IIFE pattern to `export const Calc = { ... }` (or individual named exports). Update all call sites.
- `src/components/tweaks/TweaksPanel.jsx`, plus `Tweak*` components — port from draft.
- `src/styles/main.css` — from draft `styles.css`. (Or import per-component CSS modules.)

#### 4. Fix mojibake at the source

Every file in the drafts has corrupted UTF-8 glyphs. Audit checklist:

- `—` (em dash) appears as `â`
- `–` (en dash) appears as `â`
- `·` (middle dot) appears as `Â·`
- `→` (right arrow) appears as `â`
- `←` (left arrow) appears as `â`
- `₂` (subscript 2) appears as `â` (e.g. `VOâ Max` → `VO₂ Max`)
- `×` (multiplication sign) appears as `Ã`

**Action:** Configure editor / Vite to enforce UTF-8 on save (`.editorconfig` with `charset = utf-8`). Re-type each corrupted glyph as you port the file. Grep for the corruption sequences after porting:

```bash
grep -rn $'\xc3\x82\xc2\xb7\|â\|Ã' src/  # should return nothing
```

#### 5. Wire `localStorage` persistence in `useTweaks`

**File:** `src/components/tweaks/TweaksPanel.jsx`

**Change:** in `useTweaks(defaults)`, initialize state from `localStorage.getItem('pace.tweaks')` (falling back to `defaults`), and write to `localStorage.setItem('pace.tweaks', JSON.stringify(next))` on every change in addition to the existing `postMessage`. The host-message channel stays — it only matters in the prototyping host and is harmless in production.

#### 6. Fix the visible bugs from the code review

- **TweakSection prop mismatch** ([src/App.jsx PaceTweaks]): change `<TweakSection title="...">` → `label="..."` (or rename the `TweakSection` prop to `title` — either way, pick one and match).
- **Negative-split math** ([src/pages/MarathonPage.jsx]): the label says `+30s/km slower` but the math is `total/2 ± 15 * 21.0975` (15s/km). Decide intent (probably 30s/km cushion split) and use `30 * 21.0975` symmetrically — but cap the second half so it doesn't go negative for fast goal times.
- **Duplicate CSS property** ([src/pages/MarathonPage.jsx ~L110]): `style={{ fontSize: 12, color: "var(--muted)", color: "var(--accent)" }}` — remove the dead first `color`.
- **Brittle accent mapping** ([src/App.jsx]): replace the hex-to-name lookup with palette options that carry their preset name. E.g. each `TweakColor` option is `{ name: 'coral', colors: ['#E87A4B', ...] }` so `applyAccent(tweaks.accent.name)` is direct.
- **Dead Workspace mode tabs** ([src/home/Workspace.jsx]): "recent race" vs "goal time" only swaps button text. Either make "goal time" back-solve required paces (probably the intent) or remove the toggle for now. Recommend remove — a focused first cut beats a stub.
- **Calc unit conversion mixup** ([src/pages/MarathonPage.jsx benchmarks]): `(sec / 42.195) * (units === "km" ? 1 : 1 / 0.621371)` is fine but obscure — use `Calc.pacePerKmToPerMi(sec / 42.195)` for symmetry with the rest of the codebase.

#### 7. Add Vercel redirect from old vanilla URLs to new

**File:** `vercel.json` (or `vercel.ts` per the latest Vercel guidance)

Redirect map for the URLs the vanilla site exposed:
- `/vo2-max-calculator.html` → `/vo2`
- `/marathon-pace-calculator.html` → `/marathon`
- `/contact.html` → `/contact`
- `/privacy-policy.html`, `/terms-of-use.html` → preserved at `/legacy/...` for one release (or recreated in the new site if they have inbound links).

Use 301 permanent redirects so any external links flow into the new site.

### Success criteria

#### Automated
- [ ] `npm install && npm run build` exits 0; outputs `dist/`.
- [ ] `npm run dev` serves the site on `localhost:5173` with no console errors.
- [ ] `grep -rn $'\xc3\x82\xc2\xb7\|â\|Ã' src/` returns nothing (mojibake check).
- [ ] `localStorage.getItem('pace.tweaks')` is populated after first tweak change and survives reload.

#### Code review
- [ ] No `<script src="https://unpkg.com/@babel/standalone..."` anywhere.
- [ ] `calc.js` exported via ES modules, not `window.Calc`.
- [ ] No `/*EDITMODE-BEGIN*/` markers in production code.
- [ ] Accent preset selection is data-driven (no hex-to-name `if/else`).

#### Manual
- [ ] Vercel preview deploy renders the home dashboard correctly (entering a 10K time produces VDOT, paces, splits, predictions).
- [ ] Theme toggle, accent switch, and km/mi unit toggle all persist across a hard reload.
- [ ] Marathon page's negative-split math now matches its labels.
- [ ] Navigating to `/vo2-max-calculator.html` 301-redirects to `/#/vo2` (or `/vo2`).
- [ ] `/legacy/` still serves the old site, accessible by direct URL.

---

## Phase 2 — Production polish

### Overview

The redesign is up but missing the things that make it a real site: SEO metadata, analytics, a working contact form, an ad strategy, mobile QA, accessibility passes, a 404 route, and VO₂ gender selection.

### Changes required

#### 1. SEO + social metadata

**File:** `index.html` (Vite entry).

Add per-route meta via `react-helmet-async` (or a tiny custom hook that mutates `<title>` and `<meta>` on route change):

- `<title>` per page (home, marathon, vo2, guide, contact)
- `<meta name="description">` with calculator-relevant copy
- OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`)
- Twitter card (`twitter:card="summary_large_image"`)
- Canonical link per page
- Favicon (`favicon.svg` + `apple-touch-icon.png`)
- `robots.txt`, `sitemap.xml` regenerated for the new URL structure (root-level)

#### 2. Wire Vercel Analytics

**Files:** `src/App.jsx`, `package.json` (already has dep).

Add `import { Analytics } from '@vercel/analytics/react'` and render `<Analytics />` in `<App />`. Optionally `import { SpeedInsights } from '@vercel/speed-insights/react'` for Core Web Vitals tracking.

#### 3. Real contact form backend

**Files:**
- `api/contact.js` (new) — Vercel serverless function. Accepts `{ email, topic, message }`, validates, sends via Resend / SendGrid / Postmark (pick one).
- `src/pages/ContactPage.jsx` — `onSubmit` fetches `/api/contact` and surfaces real success/error states.

Set env vars via `vercel env add` (e.g. `RESEND_API_KEY`).

#### 4. Ad slot decision

The draft has a placeholder `sponsor` row reading `Ad slot · 728 × 90 · runner-relevant placements only`. Decide:

- **Ship without ads** (recommended for first version) — delete the row.
- **AdSense / Carbon Ads** — integrate one. AdSense is faster to set up, Carbon Ads is higher quality for design-conscious sites but requires approval.

#### 5. Mobile QA pass

Use Playwright or manual device testing across the standard viewports (iPhone SE 375px, iPhone 14 390px, iPad 768px, desktop 1280px+). Known suspect areas:

- Mobile nav dropdown positioning ([src/App.jsx Nav]) — `position: absolute; top: 100%` needs the parent `<nav>` to be `position: relative`.
- Splits grid on narrow screens — `repeat(auto-fill, minmax(110px, 1fr))` may produce 1 column on iPhone SE.
- VO₂ age-band table overflow (already has `overflow-x: auto`, verify it works on touch).
- Time inputs (`time-segs`) on iOS Safari — `<input type="number">` keyboard.

#### 6. Accessibility audit

Run `npx @axe-core/cli http://localhost:5173` and address criticals:

- All icon buttons (theme toggle, mobile menu, swatch chips) need `aria-label`.
- `<table>` on VO₂ page needs `<caption>` or `aria-label`.
- Hash-based route changes need an `aria-live` announcement (`<div aria-live="polite">Navigated to {pageTitle}</div>`).
- Focus management: when results render on the home dashboard, move focus to the results heading.
- Color contrast: verify accent-on-paper combinations meet 4.5:1 (the coral default is close).
- `prefers-reduced-motion`: disable `.fade-in` animation and pace-row hover slide.

#### 7. 404 fallback route

**File:** `src/App.jsx` — when `route_path` matches no known page, render a `<NotFoundPage />` with a link back to `/`.

#### 8. VO₂ gender selector

**File:** `src/pages/VO2Page.jsx`

Add a gender toggle (male / female / unspecified). When unspecified, show both columns highlighted but no "+X.Y" delta. When set, the delta column compares against the selected gender's column.

### Success criteria

#### Automated
- [ ] `npx @axe-core/cli http://localhost:5173/#/` reports zero critical issues.
- [ ] Lighthouse SEO score ≥ 95.
- [ ] Lighthouse Accessibility score ≥ 95.
- [ ] `vercel build && vercel deploy --prebuilt` succeeds on a preview URL.
- [ ] `curl -X POST .../api/contact -d '{...}'` returns 200 with valid input, 400 with invalid.

#### Code review
- [ ] Every route sets its own `<title>` and `<meta name="description">`.
- [ ] No hard-coded API keys; everything via `process.env`.
- [ ] No `alert()` or `prompt()` calls.

#### Manual
- [ ] Submitting the contact form actually delivers an email.
- [ ] Sharing a marathon page link to Twitter shows a card with the right title/description/image.
- [ ] Site is usable end-to-end on a 375px-wide screen with no horizontal scroll.
- [ ] VO₂ gender selector changes the delta column appropriately.
- [ ] Typing a junk URL like `/#/asdf` renders a 404 page, not a blank shell.

---

## Phase 3 — Quality + growth

### Overview

The site is shipped and instrumented. This phase adds test coverage, a PWA shell, a calculation history feature, and CI to keep quality from regressing.

### Changes required

#### 1. Vitest unit tests for `calc.js`

**File:** `src/lib/calc.test.js`

`calc.js` is pure — easy wins:

- VDOT for known race performances (e.g. 30:00 10K ≈ 51).
- Riegel prediction (5K → 10K, 10K → Marathon edge cases).
- Pace formatting round-trip (`parseTime` → `fmtPace` → expected string).
- Splits include all milestones (1K, 5K, 10K, Half, 30K, Marathon).
- Karvonen vs %-max HR zone math.
- Calorie MET selection thresholds.
- Negative-split math from Marathon page (catches the bug fixed in Phase 1.6).

#### 2. Playwright smoke test

**File:** `e2e/home.spec.ts`

One scenario: load `/`, enter 10K + 45:00, click "Get my paces", assert that the dashboard renders with the VDOT number visible.

Run in CI via `@playwright/test`.

#### 3. PWA manifest + service worker

**Files:**
- `public/manifest.webmanifest`
- `vite-plugin-pwa` (or hand-rolled service worker)

Cache CSS/JS/HTML so the calculators work offline. Installable on mobile home screens.

#### 4. Calculation history in `localStorage`

**File:** `src/lib/history.js`

Save the last 20 calculations (race, time, computed VDOT, timestamp). Show a "Recent calculations" strip on the home page above the workspace if non-empty. Clicking one rehydrates the dashboard.

#### 5. CI workflow

**File:** `.github/workflows/ci.yml`

On every push:
- `npm ci`
- `npm run lint`
- `npm run test`
- `npm run build`
- Playwright smoke test

Vercel handles the deploy.

#### 6. Recover the engagement layer ideas (if still wanted)

The vanilla `js/engagement.js` had decent ideas: a sticky bottom nav showing calculator progress (1/6 → 6/6) and a "What's next" prompt after each calculation. Most of that is implicitly covered by the new single-workspace flow, but the **"complete all six standalone tools" gamification** could survive into the React version as a small persistence-backed achievement. Optional; weigh against scope.

### Success criteria

#### Automated
- [ ] `npm test` runs Vitest + Playwright; both green.
- [ ] CI workflow gates merges to `main`.
- [ ] Lighthouse PWA score ≥ 90; site installable on iOS/Android.
- [ ] `npm run build` bundle size < 200 KB gzipped (target).

#### Code review
- [ ] Every exported function in `calc.js` has at least one test.
- [ ] Service worker scope is `/`.
- [ ] No console warnings in production build.

#### Manual
- [ ] Disable network, reload the page, calculators still work.
- [ ] Install the site on an iPhone home screen; launches without browser chrome.
- [ ] "Recent calculations" populates after first use and survives reload.
- [ ] Pushing a PR that breaks a test blocks the merge.

---

## Testing strategy

- **Phase 1** ships without tests (intentional — speed of landing > coverage at the draft → real stage). Manual verification per Phase 1 success criteria.
- **Phase 2** adds the contact API tests (request/response), axe-core a11y scans, and Lighthouse runs as PR gates.
- **Phase 3** introduces Vitest for `calc.js` and Playwright for the home flow, both wired into CI.

The negative-split math bug (Phase 1.6) is exactly the class of thing that would have been caught by a Vitest case — once Phase 3 lands, this regression class is closed.

## Open questions

1. **Domain & DNS:** does the production domain stay, and do we need a maintenance window for the redirect cutover?
2. **Contact endpoint provider:** Resend, SendGrid, Postmark, or Formspree? Phase 2 needs this to choose.
3. **Ads:** ship with or without, and which provider if with?
4. **Sitemap / inbound links:** are there meaningful inbound links to `vo2-max-calculator.html` etc. that justify the redirects, or can we drop them?

## References

- Draft files (attached in planning session, not yet on disk):
  - `index.html`, `app.jsx`, `home.jsx`, `tools.jsx`, `pages.jsx`, `tweaks-panel.jsx`, `calc.js`, `styles.css`
- Existing vanilla site (on disk, becoming `legacy/`):
  - `/index.html`, `/js/*.js`, `/css/*.css`, `/vo2-max-calculator.html`, `/marathon-pace-calculator.html`, `/contact.html`
- Vercel `vercel.ts` config: https://vercel.com/docs/project-configuration/vercel-ts
- Vercel Functions (for `/api/contact`): default Node 24 LTS, 300s timeout, Fluid Compute.
