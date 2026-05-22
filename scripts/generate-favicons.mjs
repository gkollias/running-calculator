// Generate PNG favicon variants from public/favicon.svg using Playwright
// (already installed for e2e tests). Run with `npm run favicons:gen`.
//
// Google's SERP favicon crawler accepts SVG but its acceptance rate is
// noticeably better when raster variants are also present. iOS in
// particular needs apple-touch-icon.png (no SVG support there).

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(HERE, '..', 'public');
const svg = readFileSync(resolve(PUBLIC, 'favicon.svg'), 'utf8');
const svgB64 = Buffer.from(svg).toString('base64');

// (filename, pixel size). Sizes chosen for the most common consumers:
// - 32 / 16   browser tab + Google SERP
// - 180       apple-touch-icon (iOS home screen)
// - 192 / 512 PWA manifest install icons
const TARGETS = [
  ['favicon-16x16.png', 16],
  ['favicon-32x32.png', 32],
  ['apple-touch-icon.png', 180],
  ['icon-192.png', 192],
  ['icon-512.png', 512],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });

for (const [name, size] of TARGETS) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`
    <!doctype html>
    <html><head><style>
      html,body{margin:0;padding:0;background:transparent}
      img{display:block;width:${size}px;height:${size}px}
    </style></head>
    <body><img src="data:image/svg+xml;base64,${svgB64}" /></body></html>
  `);
  // Give the rasterizer a beat to settle.
  await page.waitForLoadState('networkidle');
  await page.screenshot({
    path: resolve(PUBLIC, name),
    omitBackground: false,
    clip: { x: 0, y: 0, width: size, height: size },
  });
  console.log(`Wrote public/${name} (${size}×${size})`);
  await page.close();
}

await browser.close();
