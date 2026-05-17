// Generate public/og-image.png from an HTML template using the Playwright
// browser that's already installed for e2e tests. Run with `npm run og:gen`.
//
// 1200×630 is the recommended OG image size (Twitter, LinkedIn, Slack, FB,
// Discord all crop/letterbox correctly at this ratio). 2× device pixel ratio
// keeps the result sharp on high-DPI displays where previews are rendered.

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_PATH = resolve(HERE, '..', 'public', 'og-image.png');

const HTML = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 1200px; height: 630px; overflow: hidden; }
      body {
        background: #F4EFE4;
        color: #14110D;
        font-family: 'Geist', system-ui, sans-serif;
        position: relative;
        padding: 64px 72px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      /* Decorative grid lines to add interest without distracting */
      .grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(to right, rgba(20,17,13,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(20,17,13,0.04) 1px, transparent 1px);
        background-size: 60px 60px;
        pointer-events: none;
      }
      .kicker {
        font-family: 'JetBrains Mono', ui-monospace, monospace;
        font-size: 18px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: #6E675B;
        display: inline-flex; align-items: center; gap: 14px;
      }
      .kicker::before {
        content: ''; display: inline-block;
        width: 36px; height: 2px; background: #E87A4B;
      }
      .brand {
        font-family: 'Instrument Serif', 'Times New Roman', serif;
        font-size: 168px;
        line-height: 0.96;
        letter-spacing: -0.025em;
        font-weight: 400;
        margin-top: 26px;
        margin-bottom: 18px;
      }
      .brand .dot { color: #E87A4B; }
      .tagline {
        font-family: 'Instrument Serif', serif;
        font-size: 64px;
        line-height: 1;
        letter-spacing: -0.02em;
        font-weight: 400;
        max-width: 18ch;
      }
      .tagline em {
        font-style: italic;
        color: #E87A4B;
      }
      .bottom-row {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 32px;
      }
      .features {
        font-family: 'JetBrains Mono', monospace;
        font-size: 17px;
        letter-spacing: 0.12em;
        color: #6E675B;
        text-transform: uppercase;
      }
      .features b { color: #14110D; font-weight: 600; }
      .domain {
        font-family: 'JetBrains Mono', monospace;
        font-size: 17px;
        letter-spacing: 0.05em;
        color: #6E675B;
        white-space: nowrap;
      }
    </style>
  </head>
  <body>
    <div class="grid"></div>

    <div>
      <div class="kicker">Running tools for the curious</div>
      <div class="brand">PACE<span class="dot">.</span></div>
      <div class="tagline">Find your <em>pace</em>.<br/>Plan the <em>race</em>.</div>
    </div>

    <div class="bottom-row">
      <div class="features">
        <b>VDOT</b> &nbsp;·&nbsp; <b>Pace</b> &nbsp;·&nbsp; <b>Splits</b>
        &nbsp;·&nbsp; <b>HR Zones</b> &nbsp;·&nbsp; <b>VO₂ Max</b>
      </div>
      <div class="domain">runningpacecalculator.fit</div>
    </div>
  </body>
</html>
`;

const browser = await chromium.launch();
const ctx = await browser.newContext({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 2,
});
const page = await ctx.newPage();
await page.setContent(HTML, { waitUntil: 'networkidle' });
// Give web fonts a beat to settle even after networkidle.
await page.waitForTimeout(500);
await page.screenshot({ path: OUT_PATH, type: 'png', omitBackground: false });
await browser.close();
console.log(`Wrote ${OUT_PATH}`);
