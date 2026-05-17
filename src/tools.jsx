// Standalone tools section + tool detail panels.

import React, { useState } from 'react';
import { Calc } from './lib/calc.js';

const TOOLS = [
  {
    id: 'pace',
    num: '01',
    title: 'Pace calculator',
    desc: 'Convert between distance, time, and pace. Switch between km and miles instantly.',
  },
  {
    id: 'splits',
    num: '02',
    title: 'Race splits',
    desc: 'Generate kilometer or mile splits for any pace and distance. Print for race day.',
  },
  {
    id: 'hr',
    num: '03',
    title: 'Heart-rate zones',
    desc: 'Five training zones using either % of max HR or the Karvonen reserve method.',
  },
  {
    id: 'predict',
    num: '04',
    title: 'Race time predictor',
    desc: "Project your time across 1 mile, 5K, 10K, Half, and Marathon using Riegel's formula.",
  },
  {
    id: 'calorie',
    num: '05',
    title: 'Calorie estimator',
    desc: 'Energy expenditure using MET values, weighted with a simpler distance-based check.',
  },
  {
    id: 'vdot',
    num: '06',
    title: 'VDOT calculator',
    desc: 'Compute your VDOT score from any race performance. Returns full training paces.',
  },
];

function ToolPace({ units }) {
  const [dist, setDist] = useState(10);
  const [t, setT] = useState({ h: 0, m: 45, s: 0 });
  const total = Calc.parseTime(t.h, t.m, t.s);
  const distKm = units === 'km' ? dist : Calc.miToKm(dist);
  const paceKm = total > 0 && distKm > 0 ? total / distKm : 0;
  const paceShow = units === 'km' ? paceKm : Calc.pacePerKmToPerMi(paceKm);
  const speedKmh = distKm > 0 && total > 0 ? (distKm / total) * 3600 : 0;
  return (
    <div className="grid-12">
      <div className="card col-6">
        <div className="card-label">Inputs</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Distance ({units})</label>
          <div className="control">
            <input
              type="number"
              step="0.1"
              value={dist}
              onChange={(e) => setDist(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
        <div className="field">
          <label>Time</label>
          <div className="control time-segs">
            <input
              type="number"
              min="0"
              value={t.h}
              onChange={(e) => setT({ ...t, h: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.m}
              onChange={(e) => setT({ ...t, m: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.s}
              onChange={(e) => setT({ ...t, s: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="card solid col-6">
        <div className="card-label">Result</div>
        <div className="big-number" style={{ fontSize: 72 }}>
          {Calc.fmtPace(paceShow)}
          <span className="unit">/ {units}</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--muted-2)',
            marginTop: 24,
            lineHeight: 1.8,
            letterSpacing: '0.06em',
          }}
        >
          SPEED &nbsp;·&nbsp; {speedKmh.toFixed(2)} KM/H ({(speedKmh * 0.621371).toFixed(2)} MPH)
          <br />
          {units === 'km' ? 'MILE PACE' : 'KM PACE'} &nbsp;·&nbsp;
          {Calc.fmtPace(units === 'km' ? Calc.pacePerKmToPerMi(paceKm) : paceKm)} /{' '}
          {units === 'km' ? 'mi' : 'km'}
        </div>
      </div>
    </div>
  );
}

function ToolSplits({ units }) {
  const [pace, setPace] = useState({ m: 5, s: 0 });
  const [raceId, setRaceId] = useState('10k');
  const race = Calc.RACES.find((r) => r.id === raceId);
  const paceSec = (parseInt(pace.m) || 0) * 60 + (parseInt(pace.s) || 0);
  const distanceKm = race.meters / 1000;
  const items = paceSec > 0 ? Calc.splits(paceSec, distanceKm) : [];
  const display = items.filter((x) => {
    if (x.final) return true;
    if (x.km <= 10) return true;
    return x.km % 5 === 0 || [21.0975, 42.195].some((m) => Math.abs(m - x.km) < 0.001);
  });

  return (
    <div className="grid-12">
      <div className="card col-4">
        <div className="card-label">Inputs</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Target pace (per {units})</label>
          <div className="control time-segs">
            <input
              type="number"
              min="0"
              value={pace.m}
              onChange={(e) => setPace({ ...pace, m: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={pace.s}
              onChange={(e) => setPace({ ...pace, s: e.target.value })}
            />
          </div>
        </div>
        <div className="field">
          <label>Race distance</label>
          <div className="control">
            <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
              {Calc.RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: 14,
            background: 'var(--paper-3)',
            borderRadius: 8,
            fontFamily: 'var(--mono)',
            fontSize: 12,
            color: 'var(--muted)',
            letterSpacing: '0.04em',
          }}
        >
          FINISH TIME
          <br />
          <span
            style={{
              color: 'var(--ink)',
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: '-0.005em',
            }}
          >
            {Calc.fmtTime(paceSec * distanceKm)}
          </span>
        </div>
      </div>
      <div className="card col-8">
        <div className="card-label">Splits</div>
        <div className="splits-grid">
          {display.map((s, i) => {
            const isMile = [21.0975, 42.195].some((m) => Math.abs(m - s.km) < 0.001);
            const km = units === 'km' ? s.km : Calc.kmToMi(s.km);
            return (
              <div
                key={i}
                className={'split-cell' + (s.milestone || isMile ? ' milestone' : '')}
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
    </div>
  );
}

function ToolHR() {
  const [max, setMax] = useState(185);
  const [rest, setRest] = useState('');
  const zones = Calc.hrZones(parseInt(max) || 185, parseInt(rest) || null);
  return (
    <div className="grid-12">
      <div className="card col-4">
        <div className="card-label">Inputs</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Max heart rate</label>
          <div className="control">
            <input
              type="number"
              min="100"
              max="220"
              value={max}
              onChange={(e) => setMax(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Resting HR (optional · Karvonen)</label>
          <div className="control">
            <input
              type="number"
              min="30"
              max="100"
              value={rest}
              placeholder="e.g. 55"
              onChange={(e) => setRest(e.target.value)}
            />
          </div>
        </div>
        <div
          style={{
            marginTop: 18,
            padding: 14,
            fontSize: 12,
            color: 'var(--muted)',
            lineHeight: 1.6,
          }}
        >
          Method:&nbsp;
          <strong style={{ color: 'var(--ink)' }}>
            {rest ? 'Karvonen (heart-rate reserve)' : '% of max HR'}
          </strong>
        </div>
      </div>
      <div className="card col-8">
        <div className="card-label">Training zones</div>
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
    </div>
  );
}

function ToolPredict({ units }) {
  const [raceId, setRaceId] = useState('10k');
  const [t, setT] = useState({ h: 0, m: 45, s: 0 });
  const race = Calc.RACES.find((r) => r.id === raceId);
  const total = Calc.parseTime(t.h, t.m, t.s);
  const preds = total > 0 ? Calc.predictAll(race.meters, total) : [];
  return (
    <div className="grid-12">
      <div className="card col-4">
        <div className="card-label">Your known race</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Distance</label>
          <div className="control">
            <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
              {Calc.RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Time</label>
          <div className="control time-segs">
            <input
              type="number"
              min="0"
              value={t.h}
              onChange={(e) => setT({ ...t, h: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.m}
              onChange={(e) => setT({ ...t, m: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.s}
              onChange={(e) => setT({ ...t, s: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="card col-8">
        <div className="card-label">Predicted finishes</div>
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
                        INPUT
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
    </div>
  );
}

function ToolCalorie({ units }) {
  const [weight, setWeight] = useState(70);
  const [dist, setDist] = useState(10);
  const [mins, setMins] = useState(50);
  const distKm = units === 'km' ? dist : Calc.miToKm(dist);
  const cal =
    parseFloat(weight) > 0 && distKm > 0 && parseFloat(mins) > 0
      ? Calc.calories(parseFloat(weight), distKm, parseFloat(mins))
      : null;
  return (
    <div className="grid-12">
      <div className="card col-6">
        <div className="card-label">Inputs</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Body weight (kg)</label>
          <div className="control">
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Distance ({units})</label>
          <div className="control">
            <input
              type="number"
              step="0.1"
              value={dist}
              onChange={(e) => setDist(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label>Time (minutes)</label>
          <div className="control">
            <input
              type="number"
              value={mins}
              onChange={(e) => setMins(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="card solid col-6">
        <div className="card-label">Calories burned</div>
        <div className="big-number" style={{ fontSize: 88 }}>
          {cal ? cal.average : 0}
          <span className="unit">KCAL</span>
        </div>
        {cal && (
          <div
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              color: 'var(--muted-2)',
              marginTop: 24,
              lineHeight: 1.8,
              letterSpacing: '0.06em',
            }}
          >
            MET METHOD &nbsp;·&nbsp; {cal.met_calories} KCAL
            <br />
            SIMPLE METHOD &nbsp;·&nbsp; {cal.simple_calories} KCAL
            <br />
            AVG SPEED &nbsp;·&nbsp; {cal.speed.toFixed(1)} KM/H
            <br />
            MET VALUE &nbsp;·&nbsp; {cal.met}
          </div>
        )}
      </div>
    </div>
  );
}

function ToolVDOT() {
  const [raceId, setRaceId] = useState('5k');
  const [t, setT] = useState({ h: 0, m: 22, s: 0 });
  const race = Calc.RACES.find((r) => r.id === raceId);
  const total = Calc.parseTime(t.h, t.m, t.s);
  const vdot = total > 0 ? Calc.vdotFromRace(race.meters, total) : 0;
  const vo2 = total > 0 ? Calc.vo2Max(race.meters, total) : 0;
  return (
    <div className="grid-12">
      <div className="card col-5">
        <div className="card-label">Inputs</div>
        <div className="field" style={{ marginBottom: 14 }}>
          <label>Race distance</label>
          <div className="control">
            <select value={raceId} onChange={(e) => setRaceId(e.target.value)}>
              {Calc.RACES.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label>Finish time</label>
          <div className="control time-segs">
            <input
              type="number"
              min="0"
              value={t.h}
              onChange={(e) => setT({ ...t, h: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.m}
              onChange={(e) => setT({ ...t, m: e.target.value })}
            />
            <span className="colon">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={t.s}
              onChange={(e) => setT({ ...t, s: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="card solid col-7">
        <div className="card-label">Result</div>
        <div className="big-number">{vdot ? vdot.toFixed(1) : '—'}</div>
        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: 'var(--muted-2)',
            marginTop: 20,
            lineHeight: 1.8,
            letterSpacing: '0.06em',
          }}
        >
          VDOT SCORE
          <br />
          EST. VO₂ MAX &nbsp;·&nbsp; {vo2 ? vo2.toFixed(1) : '—'} ML/KG/MIN
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
          Want training paces too? Use the goal workspace at the top — it pipes
          this VDOT into pace zones, splits, and race predictions.
        </div>
      </div>
    </div>
  );
}

export function ToolsSection({ units }) {
  const [open, setOpen] = useState(null);

  const renderTool = (id) => {
    switch (id) {
      case 'pace':
        return <ToolPace units={units} />;
      case 'splits':
        return <ToolSplits units={units} />;
      case 'hr':
        return <ToolHR />;
      case 'predict':
        return <ToolPredict units={units} />;
      case 'calorie':
        return <ToolCalorie units={units} />;
      case 'vdot':
        return <ToolVDOT />;
      default:
        return null;
    }
  };

  return (
    <section className="tools" id="tools">
      <div className="shell">
        <div className="section-head">
          <div>
            <div className="kicker">Standalone tools</div>
            <h2>
              One-off calculators
              <br />
              for everything else.
            </h2>
          </div>
          <div className="sub">
            All six original tools, redesigned and consistent. Use them on their own,
            or just enter a race up top and they fill in automatically.
          </div>
        </div>

        {open ? (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: 34,
                  letterSpacing: '-0.02em',
                  fontWeight: 400,
                }}
              >
                {TOOLS.find((t) => t.id === open).title}
              </h3>
              <button className="btn-ghost" onClick={() => setOpen(null)}>
                ← All tools
              </button>
            </div>
            {renderTool(open)}
          </div>
        ) : (
          <div className="tools-grid">
            {TOOLS.map((t) => (
              <button key={t.id} className="tool-card" onClick={() => setOpen(t.id)}>
                <div className="num">{t.num} · TOOL</div>
                <h3>{t.title}</h3>
                <p>{t.desc}</p>
                <div className="open">
                  <span>Open</span>
                  <span className="arrow">→</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
