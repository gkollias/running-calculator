/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  test: {
    // Playwright specs live under e2e/ and use @playwright/test, not vitest.
    exclude: ['node_modules', 'dist', '.git', '.vite', 'e2e/**', 'playwright-report/**'],
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon-16x16.png',
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'robots.txt',
        'sitemap.xml',
        'sitemap-pages.xml',
        'sitemap_index.xml',
        'ads.txt',
        'og-image.png',
      ],
      manifest: {
        name: 'PACE. — Running tools for the curious',
        short_name: 'PACE.',
        description:
          'Pace, splits, VDOT, heart-rate zones, calories, and race predictions in one workspace.',
        theme_color: '#F4EFE4',
        background_color: '#F4EFE4',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        lang: 'en',
        icons: [
          {
            src: '/favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache the built app shell. Fonts are loaded from Google
        // (cross-origin); cache them at runtime with CacheFirst.
        globPatterns: ['**/*.{js,css,html,svg,ico,txt,xml,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
