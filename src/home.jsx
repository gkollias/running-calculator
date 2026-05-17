// Home: goal-driven workspace + results dashboard.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calc } from './lib/calc.js';

function TimeInput({ value, onChange, includeHours = true }) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="field">
      <label>Time</label>
      <div className="control time-segs">
        {includeHours && (
          <>
            <input
              type="number"
              min="0"
              max="23"
              value={value.h ?? 0}
              onChange={(e) => set('h', e.target.value)}
              aria-label="hours"
            />
            <span className="colon">:</span>
          </>
        )}
        <input
          type="number"
          min="0"
          max="59"
          value={value.m ?? 0}
          onChange={(e) => set('m', e.target.value)}
          aria-label="minutes"
        />
        <span className="colon">:</span>
        <input
          type="number"
          min="0"
          max="59"
          value={value.s ?? 0}
          onChange={(e) => set('s', e.target.value)}
          aria-label="seconds"
        />
      </div>
    </div>
  );
}

export function Workspace({ onCompute }) {
  const [raceId, setRaceId] = useState('10k');
  const [time, setTime] = useState(Calc.DEFAULT_TIMES['10k']);
  const [maxHR, setMaxHR] = useState(185);
  const [weight, setWeight] = useState(70);
  const [error, setError] = useState(null);

  // Reset to a realistic default whenever the race distance changes so a
  // user clicking from 10K to Marathon doesn't keep the 58-min default.
  useEffect(() => {
    setTime(Calc.DEFAULT_TIMES[raceId] || { h: 0, m: 0, s: 0 });
    setError(null);
  }, [raceId]);

  const submit = () => {
    const race = Calc.RACES.find((r) => r.id === raceId);
    const total = Calc.parseTime(time.h, time.m, time.s);
    if (total <= 0) {
      setError('Enter a time greater than zero.');
      return;
    }
    if (!Calc.isTimeRealistic(raceId, total)) {
      setError(
        `That's faster than the world record for ${race.name}. Try a more realistic time.`
      );
      return;
    }
    setError(null);
    onCompute({
      race,
      totalSeconds: total,
      maxHR: parseInt(maxHR) || null,
      weight: parseFloat(weight) || 70,
    });
  };

  return (
    <section className="workspace">
      <div className="shell">
        <div className="input-row">
          <div className="field">
            <label htmlFor="workspace-race">Recent race or training target</label>
            <div className="control">
              <select
                id="workspace-race"
                aria-label="Recent race or training target"
                value={raceId}
                onChange={(e) => setRaceId(e.target.value)}
              >
                {Calc.RACES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <TimeInput value={time} onChange={setTime} includeHours={true} />

          <button className="btn-primary" onClick={submit}>
            Get my paces
            <span className="arrow">→</span>
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 14,
              padding: '10px 14px',
              background: 'var(--accent-soft)',
              color: 'var(--accent-ink)',
              border: '1px solid var(--accent-line)',
              borderRadius: 10,
              fontSize: 13,
              fontFamily: 'var(--sans)',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 20, marginTop: 22, flexWrap: 'wrap' }}>
          <details style={{ flex: 1, minWidth: 280 }}>
            <summary
              style={{
                cursor: 'pointer',
                color: 'var(--muted)',
                fontSize: 13,
                fontFamily: 'var(--mono)',
                letterSpacing: '0.06em',
                padding: '8px 0',
              }}
            >
              ▸ Optional: heart rate &amp; weight (for zones &amp; calories)
            </summary>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
                marginTop: 14,
              }}
            >
              <div className="field">
                <label>Max heart rate</label>
                <div className="control">
                  <input
                    type="number"
                    min="100"
                    max="220"
                    value={maxHR}
                    onChange={(e) => setMaxHR(e.target.value)}
                  />
                </div>
              </div>
              <div className="field">
                <label>Weight (kg)</label>
                <div className="control">
                  <input
                    type="number"
                    min="30"
                    max="200"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}

function PaceChart({ vdot, units }) {
  const zones = useMemo(() => Calc.trainingPaces(vdot), [vdot]);
  const rows = [
    { key: 'easy', label: 'Easy', color: 'oklch(0.78 0.10 195)' },
    { key: 'marathon', label: 'Marathon', color: 'oklch(0.72 0.13 150)' },
    { key: 'threshold', label: 'Threshold', color: 'oklch(0.78 0.15 85)' },
    { key: 'interval', label: 'Interval', color: 'oklch(0.70 0.16 50)' },
    { key: 'repetition', label: 'Repetition', color: 'oklch(0.62 0.18 25)' },
  ];
  const fastest = Math.min(...rows.map((r) => zones[r.key].min));
  const slowest = Math.max(...rows.map((r) => zones[r.key].max));

  const W = 600,
    H = 220,
    L = 90,
    R = 16,
    T = 14,
    B = 28;
  const innerW = W - L - R;
  const innerH = H - T - B;

  return (
    <div className="card chart-card col-7">
      <div className="card-label">Training paces · per {units}</div>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
        {rows.map((r, i) => {
          const z = zones[r.key];
          const min = units === 'km' ? z.min : Calc.pacePerKmToPerMi(z.min);
          const max = units === 'km' ? z.max : Calc.pacePerKmToPerMi(z.max);
          const fastMin = units === 'km' ? fastest : Calc.pacePerKmToPerMi(fastest);
          const slowMax = units === 'km' ? slowest : Calc.pacePerKmToPerMi(slowest);
          const x1 = L + ((slowMax - max) / (slowMax - fastMin)) * innerW;
          const x2 = L + ((slowMax - min) / (slowMax - fastMin)) * innerW;
          const y = T + i * (innerH / rows.length) + 6;
          const barH = innerH / rows.length - 12;
          return (
            <g key={r.key}>
              <text x={L - 12} y={y + barH / 2 + 4} textAnchor="end">
                {r.label.toUpperCase()}
              </text>
              <rect x={L} y={y} width={innerW} height={barH} className="bar-bg" rx="3" />
              <rect x={x1} y={y} width={Math.max(2, x2 - x1)} height={barH} rx="3" fill={r.color} />
              <text className="val-label" x={x2 + 6} y={y + barH / 2 + 4}>
                {Calc.fmtPace(min)}–{Calc.fmtPace(max)}
              </text>
            </g>
          );
        })}
        <text x={L} y={H - 8}>FASTER →</text>
        <text x={W - R} y={H - 8} textAnchor="end">← SLOWER</text>
      </svg>
    </div>
  );
}

function PaceRows({ vdot, units }) {
  const zones = Calc.trainingPaces(vdot);
  const rows = [
    {
      key: 'easy',
      name: 'Easy',
      desc: 'Recovery, long-run base. ~60–75% of max HR.',
      zone: 'zone-1',
    },
    {
      key: 'marathon',
      name: 'Marathon',
      desc: 'Sustainable for 26.2 miles. Race pace for marathon.',
      zone: 'zone-2',
    },
    {
      key: 'threshold',
      name: 'Threshold',
      desc: 'Comfortable hard. ~1 hour race effort.',
      zone: 'zone-3',
    },
    {
      key: 'interval',
      name: 'Interval',
      desc: 'VO₂ max work. Roughly 5K race pace.',
      zone: 'zone-4',
    },
    {
      key: 'repetition',
      name: 'Repetition',
      desc: 'Neuromuscular. Short, fast, full recovery.',
      zone: 'zone-5',
    },
  ];
  return (
    <div className="card col-5">
      <div className="card-label">Pace zones</div>
      <div className="pace-rows">
        {rows.map((r) => {
          const z = zones[r.key];
          const min = units === 'km' ? z.min : Calc.pacePerKmToPerMi(z.min);
          const max = units === 'km' ? z.max : Calc.pacePerKmToPerMi(z.max);
          return (
            <div key={r.key} className={'pace-row ' + r.zone}>
              <span className="swatch"></span>
              <div>
                <div className="name">{r.name}</div>
                <div className="desc">{r.desc}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="pace-val">
                  {Calc.fmtPace(min)}–{Calc.fmtPace(max)}
                </div>
                <div className="pace-unit">PER {units.toUpperCase()}</div>
              </div>
              <span style={{ width: 8 }}></span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Splits({ totalSeconds, race, units }) {
  const distanceKm = race.meters / 1000;
  const paceSec = totalSeconds / distanceKm;
  const items = Calc.splits(paceSec, distanceKm);
  const display = items.filter((x) => {
    if (x.final) return true;
    if (x.km <= 10) return true;
    return x.km % 5 === 0 || [21.0975, 42.195].some((m) => Math.abs(m - x.km) < 0.001);
  });
  return (
    <div className="card col-12">
      <div className="card-label">Pacing chart · {race.name}</div>
      <div className="splits-grid">
        {display.map((s, i) => {
          const isFinal = s.final || s.km === Math.floor(distanceKm);
          const km = units === 'km' ? s.km : Calc.kmToMi(s.km);
          return (
            <div
              key={i}
              className={'split-cell' + (s.milestone || isFinal ? ' milestone' : '')}
            >
              <div className="km">
                {km < 1 ? km.toFixed(2) : km.toFixed(km % 1 === 0 ? 0 : 1)} {units}
              </div>
              <div className="t">{Calc.fmtTime(s.seconds)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HRZonesCard({ maxHR }) {
  if (!maxHR) {
    return (
      <div className="card col-6">
        <div className="card-label">Heart rate zones</div>
        <div style={{ color: 'var(--muted)', fontSize: 14, padding: '20px 0' }}>
          Add your max heart rate in the workspace to see training zones.
        </div>
      </div>
    );
  }
  const zones = Calc.hrZones(maxHR, null);
  return (
    <div className="card col-6">
      <div className="card-label">Heart rate zones · max {maxHR} bpm</div>
      <div className="pace-rows">
        {zones.map((z, i) => (
          <div key={z.name} className={'pace-row zone-' + (i + 1)}>
            <span className="swatch"></span>
            <div>
              <div className="name">
                Zone {i + 1} · {z.name}
              </div>
              <div className="desc">{z.desc}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="pace-val">
                {z.lo}–{z.hi}
              </div>
              <div className="pace-unit">BPM</div>
            </div>
            <span style={{ width: 8 }}></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RacePredictions({ race, totalSeconds, units }) {
  const preds = Calc.predictAll(race.meters, totalSeconds);
  return (
    <div className="card col-6">
      <div className="card-label">Race time predictions · Riegel formula</div>
      <div className="predict-table">
        {preds.map((p) => {
          const distance = units === 'km' ? p.meters / 1000 : Calc.kmToMi(p.meters / 1000);
          const paceSec = p.seconds / (p.meters / 1000);
          const paceShow = units === 'km' ? paceSec : Calc.pacePerKmToPerMi(paceSec);
          return (
            <div key={p.name} className="predict-row">
              <div>
                <div className="race">
                  {p.name}
                  {p.isKnown && (
                    <span
                      style={{
                        color: 'var(--accent)',
                        fontFamily: 'var(--mono)',
                        fontSize: 11,
                        marginLeft: 10,
                        letterSpacing: '0.1em',
                        verticalAlign: 8,
                      }}
                    >
                      YOUR INPUT
                    </span>
                  )}
                </div>
                <div
                  style={{
                    color: 'var(--muted)',
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    marginTop: 4,
                    letterSpacing: '0.06em',
                  }}
                >
                  {distance.toFixed(2)} {units.toUpperCase()}
                </div>
              </div>
              <div className="time" style={p.isKnown ? { color: 'var(--accent)' } : {}}>
                {Calc.fmtTime(p.seconds)}
              </div>
              <div className="pace">
                {Calc.fmtPace(paceShow)}/{units}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VDOTHero({ vdot, vo2, race, totalSeconds }) {
  return (
    <div className="card solid col-5">
      <div className="card-label">Your VDOT score</div>
      <div className="big-number">{vdot.toFixed(1)}</div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          color: 'var(--muted-2)',
          letterSpacing: '0.1em',
          marginTop: 20,
          lineHeight: 1.7,
        }}
      >
        BASED ON {race.name.toUpperCase()} · {Calc.fmtTime(totalSeconds)}
        <br />
        EST. VO₂ MAX · {vo2.toFixed(1)} ML/KG/MIN
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.5,
          color: 'var(--muted)',
          marginTop: 20,
          paddingTop: 20,
          borderTop: '1px solid #2A2620',
        }}
      >
        VDOT is your current running fitness as a single number. Higher = faster.
        Elite men sit around 80–85, recreational runners typically 30–55.
      </div>
    </div>
  );
}

function RaceCard({ race, totalSeconds, units }) {
  const distanceKm = race.meters / 1000;
  const paceSec = totalSeconds / distanceKm;
  const paceShow = units === 'km' ? paceSec : Calc.pacePerKmToPerMi(paceSec);
  const quarters = [0.25, 0.5, 0.75, 1.0].map((q) => ({
    pct: q,
    km: distanceKm * q,
    time: totalSeconds * q,
  }));
  return (
    <div className="racecard">
      <h4>Race Day Card</h4>
      <div className="race-name">{race.name}</div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'var(--muted)',
        }}
      >
        TARGET TIME
      </div>
      <div className="target">{Calc.fmtTime(totalSeconds)}</div>
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'var(--muted)',
        }}
      >
        AVG PACE · {Calc.fmtPace(paceShow)} / {units.toUpperCase()}
      </div>
      <hr />
      <div
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.1em',
          color: 'var(--muted)',
          marginBottom: 12,
        }}
      >
        SPLITS
      </div>
      {quarters.map((q, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'var(--mono)',
            fontSize: 15,
            padding: '6px 0',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <span>{i === 3 ? 'Finish' : i === 1 ? 'Halfway' : `${q.pct * 100}%`}</span>
          <span style={{ color: 'var(--muted)' }}>
            {(units === 'km' ? q.km : Calc.kmToMi(q.km)).toFixed(2)} {units}
          </span>
          <span style={{ fontWeight: 600 }}>{Calc.fmtTime(q.time)}</span>
        </div>
      ))}
    </div>
  );
}

export function Dashboard({ result, units }) {
  const { race, totalSeconds, maxHR, weight } = result;
  const vdot = Calc.vdotFromRace(race.meters, totalSeconds);
  const vo2 = Calc.vo2Max(race.meters, totalSeconds);
  const cal = Calc.calories(weight, race.meters / 1000, totalSeconds / 60);

  // Move focus + screen-reader attention to the freshly-rendered dashboard.
  // The h2 is tabIndex={-1} so we can focus it programmatically without
  // adding it to the natural tab order.
  const headingRef = useRef(null);
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus({ preventScroll: false });
    }
  }, [race.id, totalSeconds]);

  const print = () => window.print();
  const share = () => {
    const url = new URL(window.location.href);
    url.hash = `/results?race=${race.id}&t=${totalSeconds}&hr=${maxHR || ''}&w=${weight}`;
    navigator.clipboard?.writeText(url.toString());
    const btn = document.getElementById('share-btn');
    if (btn) {
      const t = btn.textContent;
      btn.textContent = 'Link copied ✓';
      setTimeout(() => {
        btn.textContent = t;
      }, 2000);
    }
  };

  return (
    <section className="dashboard fade-in" aria-live="polite">
      <div className="shell">
        <div className="dash-head">
          <div>
            <div className="meta">
              Results · {race.name} in {Calc.fmtTime(totalSeconds)}
            </div>
            <h2 ref={headingRef} tabIndex={-1} style={{ marginTop: 8, outline: 'none' }}>
              Here's the plan.
            </h2>
          </div>
          <div className="dash-actions">
            <button className="btn-ghost" id="share-btn" onClick={share}>
              Copy share link
            </button>
            <button className="btn-ghost" onClick={print}>
              Print race card
            </button>
          </div>
        </div>

        <div className="grid-12">
          <VDOTHero vdot={vdot} vo2={vo2} race={race} totalSeconds={totalSeconds} />
          <PaceChart vdot={vdot} units={units} />
          <PaceRows vdot={vdot} units={units} />
          <RacePredictions race={race} totalSeconds={totalSeconds} units={units} />
          <Splits totalSeconds={totalSeconds} race={race} units={units} />
          <HRZonesCard maxHR={maxHR} />
          <div className="card col-6">
            <div className="card-label">Estimated calories burned</div>
            <div className="big-number" style={{ fontSize: 72 }}>
              {cal.average}
              <span className="unit">KCAL</span>
            </div>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 11,
                color: 'var(--muted)',
                marginTop: 16,
                lineHeight: 1.8,
                letterSpacing: '0.06em',
              }}
            >
              MET METHOD &nbsp;·&nbsp; {cal.met_calories} KCAL
              <br />
              SIMPLE METHOD &nbsp;·&nbsp; {cal.simple_calories} KCAL
              <br />
              SPEED &nbsp;·&nbsp; {cal.speed.toFixed(1)} KM/H
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <RaceCard race={race} totalSeconds={totalSeconds} units={units} />
        </div>
      </div>
    </section>
  );
}
