// Per-route document metadata. Vite + React with no SSR — we set head
// tags imperatively on every route change so Google's headless renderer
// and OG scrapers see distinct content per page.

import { useEffect } from 'react';

export const SITE_ORIGIN = 'https://www.runningpacecalculator.fit';
export const SITE_NAME = 'PACE.';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

export const ROUTE_META = {
  home: {
    title: 'PACE. — Running calculators for the curious',
    description:
      'Pace, splits, VDOT, heart-rate zones, calories, and race predictions in one workspace. Free, science-backed running tools.',
    path: '/',
  },
  marathon: {
    title: 'Marathon pacing strategy — PACE.',
    description:
      'Plan your marathon: required pace, every-5K splits, negative-split strategy, and how your goal compares to common benchmarks.',
    path: '/#/marathon',
  },
  vo2: {
    title: 'VO₂ Max estimator — PACE.',
    description:
      'Estimate your VO₂ max from a recent race using Daniels\' formula. See how you compare to the age-graded reference.',
    path: '/#/vo2',
  },
  guide: {
    title: 'Training guide — VDOT, pace zones, Riegel — PACE.',
    description:
      'Plain-language explanations of the formulas behind every calculator: VDOT, Riegel race prediction, Karvonen HR zones, MET energy expenditure.',
    path: '/#/guide',
  },
  contact: {
    title: 'Contact — PACE.',
    description: 'Bug report, feature request, or just say hi. Every message read by a human.',
    path: '/#/contact',
  },
  notfound: {
    title: 'Not found — PACE.',
    description: 'The page you were looking for does not exist.',
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
