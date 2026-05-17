// Root App: nav, router, tweaks, footer.

import React, { useState, useEffect } from 'react';
import { Calc } from './lib/calc.js';
import { Workspace, Dashboard } from './home.jsx';
import { ToolsSection } from './tools.jsx';
import { MarathonPage, VO2Page, ContactPage, GuidePage } from './pages.jsx';
import {
  useTweaks,
  TweaksPanel,
  TweakSection,
  TweakRadio,
  TweakColor,
} from './tweaks.jsx';
import { useDocumentMeta } from './lib/meta.js';
import { useCalcHistory } from './lib/history.js';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';

const TWEAK_DEFAULTS = {
  accent: 'coral',
  theme: 'light',
  units: 'km',
};

const ACCENT_PRESETS = {
  coral: {
    val: 'oklch(0.66 0.18 38)',
    soft: 'oklch(0.92 0.05 42)',
    line: 'oklch(0.78 0.13 38)',
    ink: '#2A0E03',
    colors: ['#E87A4B', '#F4EFE4', '#14110D'],
  },
  electric: {
    val: 'oklch(0.66 0.22 145)',
    soft: 'oklch(0.92 0.06 145)',
    line: 'oklch(0.78 0.16 145)',
    ink: '#08240D',
    colors: ['#3DAA52', '#F4EFE4', '#14110D'],
  },
  cobalt: {
    val: 'oklch(0.55 0.20 260)',
    soft: 'oklch(0.92 0.05 260)',
    line: 'oklch(0.78 0.13 260)',
    ink: '#0A1133',
    colors: ['#3C6FE0', '#F4EFE4', '#14110D'],
  },
  magenta: {
    val: 'oklch(0.62 0.24 350)',
    soft: 'oklch(0.92 0.06 350)',
    line: 'oklch(0.78 0.16 350)',
    ink: '#330722',
    colors: ['#D63E91', '#F4EFE4', '#14110D'],
  },
};

function applyAccent(name) {
  const a = ACCENT_PRESETS[name] || ACCENT_PRESETS.coral;
  const root = document.documentElement;
  root.style.setProperty('--accent', a.val);
  root.style.setProperty('--accent-soft', a.soft);
  root.style.setProperty('--accent-line', a.line);
  root.style.setProperty('--accent-ink', a.ink);
}

function parseHash(hash) {
  const h = (hash || '').replace(/^#\/?/, '');
  const [path, query = ''] = h.split('?');
  const params = {};
  query.split('&').forEach((p) => {
    const [k, v] = p.split('=');
    if (k) params[k] = decodeURIComponent(v || '');
  });
  return { path: path || 'home', params };
}

function useRoute() {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onHash = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return [route, (path) => { window.location.hash = path; }];
}

function Brand({ onClick }) {
  return (
    <a
      className="brand"
      href="#/"
      onClick={(e) => {
        e.preventDefault();
        onClick('home');
      }}
    >
      <span>PACE</span>
      <span className="dot">.</span>
      <small>RUNNING TOOLS</small>
    </a>
  );
}

function Nav({ route, navigate, units, setUnits, theme, setTheme }) {
  const links = [
    { id: 'home', label: 'Calculators' },
    { id: 'marathon', label: 'Marathon' },
    { id: 'vo2', label: 'VO₂ Max' },
    { id: 'guide', label: 'Guide' },
    { id: 'contact', label: 'Contact' },
  ];
  const [mOpen, setMOpen] = useState(false);
  return (
    <nav className="nav" style={{ position: 'sticky', top: 0 }}>
      <div
        className="shell"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Brand onClick={navigate} />
        <div className="nav-links">
          {links.map((l) => (
            <a
              key={l.id}
              href={'#/' + l.id}
              className={'nav-link' + (route.path === l.id ? ' active' : '')}
              onClick={(e) => {
                e.preventDefault();
                navigate(l.id);
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-tools">
          <div className="unit-pill" role="group" aria-label="Distance units">
            <button
              className={units === 'km' ? 'on' : ''}
              onClick={() => setUnits('km')}
              aria-pressed={units === 'km'}
              aria-label="Kilometers"
            >
              KM
            </button>
            <button
              className={units === 'mi' ? 'on' : ''}
              onClick={() => setUnits('mi')}
              aria-pressed={units === 'mi'}
              aria-label="Miles"
            >
              MI
            </button>
          </div>
          <button
            className="icon-btn"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              {theme === 'light' ? (
                <path
                  d="M11.5 9.5A5 5 0 1 1 6.5 4.5a4 4 0 0 0 5 5z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                  <circle cx="8" cy="8" r="3" fill="none" />
                  <path d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.06 1.06M4.46 11.54L3.4 12.6M12.6 12.6l-1.06-1.06M4.46 4.46L3.4 3.4" />
                </g>
              )}
            </svg>
          </button>
          <button
            className="icon-btn nav-mobile-toggle"
            onClick={() => setMOpen(!mOpen)}
            aria-label={mOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mOpen}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
            >
              <path d="M2 4h12M2 8h12M2 12h12" />
            </svg>
          </button>
        </div>
      </div>
      {mOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--paper)',
            borderBottom: '1px solid var(--line)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {links.map((l) => (
            <a
              key={l.id}
              href={'#/' + l.id}
              className={'nav-link' + (route.path === l.id ? ' active' : '')}
              onClick={(e) => {
                e.preventDefault();
                navigate(l.id);
                setMOpen(false);
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}

function HomePage({ units }) {
  const [result, setResult] = useState(null);
  const { history, addEntry, clearHistory } = useCalcHistory();

  useEffect(() => {
    const { path, params } = parseHash(window.location.hash);
    if (path === 'results' && params.race && params.t) {
      const race = Calc.RACES.find((r) => r.id === params.race);
      if (race)
        setResult({
          race,
          totalSeconds: parseInt(params.t),
          maxHR: params.hr ? parseInt(params.hr) : null,
          weight: params.w ? parseFloat(params.w) : 70,
        });
    }
  }, []);

  const onCompute = (r) => {
    setResult(r);
    addEntry({
      raceId: r.race.id,
      raceName: r.race.name,
      totalSeconds: r.totalSeconds,
      vdot: Calc.vdotFromRace(r.race.meters, r.totalSeconds),
      maxHR: r.maxHR,
      weight: r.weight,
    });
  };

  const restoreEntry = (entry) => {
    const race = Calc.RACES.find((r) => r.id === entry.raceId);
    if (!race) return;
    setResult({
      race,
      totalSeconds: entry.totalSeconds,
      maxHR: entry.maxHR,
      weight: entry.weight,
    });
  };

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">Running tools for the curious</div>
          <h1>
            Find your <em>pace</em>.<br />
            Plan the <em>race</em>.
          </h1>
          <p className="lede">
            The free running pace calculator runners use to plan training and
            race day — VDOT, race-pace splits, heart-rate zones, calorie
            estimates, and race time predictions. Enter a recent race or a goal
            time and get the full picture in one shot.
          </p>
        </div>
      </section>

      {history.length > 0 && (
        <section className="history-strip">
          <div className="shell">
            <div className="history-head">
              <span className="history-label">Recent</span>
              <button className="history-clear" onClick={clearHistory}>
                Clear
              </button>
            </div>
            <div className="history-chips">
              {history.map((e) => (
                <button
                  key={`${e.raceId}-${e.totalSeconds}`}
                  className="history-chip"
                  onClick={() => restoreEntry(e)}
                  title={`Restore ${e.raceName} in ${Calc.fmtTime(e.totalSeconds)}`}
                >
                  <span className="hc-race">{e.raceName}</span>
                  <span className="hc-sep">·</span>
                  <span className="hc-time">{Calc.fmtTime(e.totalSeconds)}</span>
                  <span className="hc-sep">·</span>
                  <span className="hc-vdot">VDOT {e.vdot.toFixed(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <Workspace onCompute={onCompute} />

      {result && <Dashboard result={result} units={units} />}

      <ToolsSection units={units} />

      <section className="trust">
        <div className="shell">
          <div className="trust-grid">
            <div className="trust-cell">
              <div className="v">10K+</div>
              <div className="l">Runners served</div>
            </div>
            <div className="trust-cell">
              <div className="v">6</div>
              <div className="l">Calculators, unified</div>
            </div>
            <div className="trust-cell">
              <div className="v">0</div>
              <div className="l">Data leaves your browser</div>
            </div>
            <div className="trust-cell">
              <div className="v">
                42<span style={{ fontSize: 22, color: 'var(--muted)' }}>.195</span>
              </div>
              <div className="l">Kilometers covered</div>
            </div>
          </div>
        </div>
      </section>

      {/* AdSense Auto Ads inject themselves based on the script tag in index.html.
          For explicit placement, drop in <ins class="adsbygoogle"> blocks with
          your specific data-ad-slot ID. */}
    </main>
  );
}

function NotFoundPage({ navigate }) {
  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">404 · Page not found</div>
          <h1>
            That route <em>doesn't exist</em>.
          </h1>
          <p className="lede">
            The page you were looking for isn't here. It may have moved, or you
            may have followed a stale link.
          </p>
          <div style={{ marginTop: 28, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn-primary"
              onClick={() => navigate('home')}
            >
              Back to home <span className="arrow">→</span>
            </button>
            <button
              className="btn-ghost"
              onClick={() => navigate('guide')}
            >
              Training guide
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Footer({ navigate }) {
  return (
    <footer>
      <div className="shell">
        <div className="foot">
          <div className="foot-brand">
            <Brand onClick={navigate} />
            <p style={{ marginTop: 14 }}>
              Calculations based on peer-reviewed exercise physiology —
              VDOT, Riegel's formula, Karvonen heart-rate reserve, and MET energy expenditure.
            </p>
          </div>
          <div>
            <h5>Tools</h5>
            <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }}>VDOT</a>
            <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Pace</a>
            <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Splits</a>
            <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Heart rate</a>
            <a href="#/home" onClick={(e) => { e.preventDefault(); navigate('home'); }}>Calories</a>
          </div>
          <div>
            <h5>Distances</h5>
            <a href="#/marathon" onClick={(e) => { e.preventDefault(); navigate('marathon'); }}>Marathon</a>
            <a href="#/vo2" onClick={(e) => { e.preventDefault(); navigate('vo2'); }}>VO₂ Max</a>
            <a href="#/guide" onClick={(e) => { e.preventDefault(); navigate('guide'); }}>Training guide</a>
          </div>
          <div>
            <h5>About</h5>
            <a href="#/contact" onClick={(e) => { e.preventDefault(); navigate('contact'); }}>Contact</a>
            <a href="#/guide" onClick={(e) => { e.preventDefault(); navigate('guide'); }}>The guide</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
        <div className="bottom-bar">
          <span>© 2026 PACE. — Free tools for runners.</span>
          <span>SCIENCE-BACKED · VDOT · RIEGEL · KARVONEN</span>
        </div>
      </div>
    </footer>
  );
}

function PaceTweaks({ tweaks, setTweak }) {
  const accentOptions = Object.entries(ACCENT_PRESETS).map(([name, p]) => ({
    name,
    colors: p.colors,
  }));
  return (
    <TweaksPanel>
      <TweakSection label="Accent color">
        <TweakColor
          value={tweaks.accent}
          options={accentOptions}
          onChange={(v) => setTweak('accent', v)}
        />
      </TweakSection>
      <TweakSection label="Theme">
        <TweakRadio
          value={tweaks.theme}
          options={['light', 'dark']}
          onChange={(v) => setTweak('theme', v)}
        />
      </TweakSection>
      <TweakSection label="Default units">
        <TweakRadio
          value={tweaks.units}
          options={['km', 'mi']}
          onChange={(v) => setTweak('units', v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

export default function App() {
  const [route, navigate] = useRoute();
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const units = tweaks.units || 'km';
  const setUnits = (u) => setTweak('units', u);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tweaks.theme || 'light');
  }, [tweaks.theme]);

  useEffect(() => {
    applyAccent(typeof tweaks.accent === 'string' ? tweaks.accent : 'coral');
  }, [tweaks.accent]);

  const knownRoutes = ['home', 'marathon', 'vo2', 'guide', 'contact'];
  const routePath = route.path === 'results' ? 'home' : route.path;
  const metaKey = knownRoutes.includes(routePath) ? routePath : 'notfound';
  useDocumentMeta(metaKey);

  return (
    <>
      <Nav
        route={route}
        navigate={navigate}
        units={units}
        setUnits={setUnits}
        theme={tweaks.theme || 'light'}
        setTheme={(t) => setTweak('theme', t)}
      />
      {routePath === 'home' && <HomePage units={units} />}
      {routePath === 'marathon' && <MarathonPage units={units} />}
      {routePath === 'vo2' && <VO2Page />}
      {routePath === 'guide' && <GuidePage />}
      {routePath === 'contact' && <ContactPage />}
      {metaKey === 'notfound' && <NotFoundPage navigate={navigate} />}
      <Footer navigate={navigate} />
      <PaceTweaks tweaks={tweaks} setTweak={setTweak} />
      <Analytics />
      <SpeedInsights />
    </>
  );
}
