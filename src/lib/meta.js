// Per-route document metadata. Vite + React with no SSR — we set head
// tags imperatively on every route change so Google's headless renderer
// and OG scrapers see distinct content per page.

import { useEffect } from 'react';

export const SITE_ORIGIN = 'https://www.runningpacecalculator.fit';
export const SITE_NAME = 'PACE.';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export const ROUTE_META = {
  home: {
    title: 'Running Pace Calculator — VDOT, Splits & Race Times | PACE.',
    description:
      'Free running pace calculator: convert pace, time, and distance. Compute VDOT, training paces, race splits, heart-rate zones, calories, and race predictions in one tool.',
    path: '/',
  },
  marathon: {
    title: 'Marathon Pace Calculator & Pacing Strategy | PACE.',
    description:
      'Plan your marathon pace, get every-5K splits, see the required pace for any goal time, and benchmark your target. Free marathon pace calculator with negative-split strategy.',
    path: '/marathon',
  },
  vo2: {
    title: 'VO₂ Max Calculator from Race Performance | PACE.',
    description:
      'Estimate your VO₂ max from a 5K, 10K, half, or marathon time. Free VO₂ max calculator using Daniels\' formula, with age-graded reference values.',
    path: '/vo2',
  },
  guide: {
    title: 'Running Training Guide — VDOT, Pace Zones & Riegel | PACE.',
    description:
      'How VDOT, Riegel race predictions, Karvonen heart-rate zones, and the 80/20 training rule work. The science behind every running calculator, explained.',
    path: '/guide',
  },
  contact: {
    title: 'Contact PACE. — Free Running Calculators',
    description:
      'Bug report, feature request, or feedback on the free running pace, VDOT, splits, heart-rate, and race-prediction calculators.',
    path: '/contact',
  },
  // Per-tool route meta (pace, splits, hr, predict, calorie, vdot) ships
  // with the per-tool landing pages in the follow-up commit.
  notfound: {
    title: 'Page Not Found | PACE. Running Pace Calculator',
    description:
      'The page you were looking for does not exist. Back to the free pace, VDOT, splits, and race-prediction calculators.',
    path: '/',
  },
};

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useDocumentMeta(routeKey) {
  useEffect(() => {
    const m = ROUTE_META[routeKey] || ROUTE_META.home;
    const url = SITE_ORIGIN + m.path;

    document.title = m.title;
    setMeta('description', m.description);

    setMeta('og:title', m.title, 'property');
    setMeta('og:description', m.description, 'property');
    setMeta('og:url', url, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:image', DEFAULT_OG_IMAGE, 'property');
    setMeta('og:site_name', SITE_NAME, 'property');

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', m.title);
    setMeta('twitter:description', m.description);
    setMeta('twitter:image', DEFAULT_OG_IMAGE);

    setLink('canonical', url);
  }, [routeKey]);
}
