// Secondary pages: Marathon, VO₂ Max, Contact, Guide.

import React, { useState } from 'react';
import { Calc } from './lib/calc.js';

export function MarathonPage({ units }) {
  const [goal, setGoal] = useState(Calc.DEFAULT_TIMES.marathon);
  const total = Calc.parseTime(goal.h, goal.m, goal.s);
  const race = { id: 'marathon', name: 'Marathon', meters: 42195 };
  const distanceKm = race.meters / 1000;
  const realistic = Calc.isTimeRealistic('marathon', total);
  const paceSec = total > 0 && realistic ? total / distanceKm : 0;
  const paceShow = units === 'km' ? paceSec : Calc.pacePerKmToPerMi(paceSec);
  const vdot = total > 0 && realistic ? Calc.vdotFromRace(race.meters, total) : 0;
  const items = total > 0 && realistic ? Calc.splits(paceSec, distanceKm) : [];

  const display = items.filter(
    (x) =>
      x.km % 5 === 0 ||
      Math.abs(x.km - 42.195) < 0.001 ||
      Math.abs(x.km - 21.0975) < 0.001
  );

  const benchmarks = [
    { label: 'Sub-3:00', h: 3, m: 0, s: 0, who: 'Elite amateur · BQ M18-34' },
    { label: 'Sub-3:30', h: 3, m: 30, s: 0, who: 'Strong amateur · BQ M40-44' },
    { label: 'Sub-4:00', h: 4, m: 0, s: 0, who: 'Avg US marathoner · BQ M55-59' },
    { label: 'Sub-4:30', h: 4, m: 30, s: 0, who: 'Avg US marathoner W' },
    { label: 'Sub-5:00', h: 5, m: 0, s: 0, who: 'First-time marathon target' },
  ];

  // Negative-split strategy: first half runs 30s/km slower than target,
  // second half 30s/km faster. Time delta per half = 30 * 21.0975 seconds.
  const negSplitDelta = 30 * 21.0975;

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">Marathon · 42.195 km · 26.2 mi</div>
          <h1>
            Plan your <em>marathon</em>
            <br />
            pacing strategy.
          </h1>
          <p className="lede">
            The marathon punishes bad pacing more than any other distance.
            Pick a goal time, get your splits, see how it compares to common benchmarks.
          </p>
        </div>
      </section>

      <section className="workspace">
        <div className="shell">
          <div className="input-row">
            <div className="field">
              <label>Goal finish time</label>
              <div className="control time-segs">
                <input
                  type="number"
                  min="2"
                  max="6"
                  value={goal.h}
                  onChange={(e) => setGoal({ ...goal, h: e.target.value })}
                />
                <span className="colon">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={goal.m}
                  onChange={(e) => setGoal({ ...goal, m: e.target.value })}
                />
                <span className="colon">:</span>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={goal.s}
                  onChange={(e) => setGoal({ ...goal, s: e.target.value })}
                />
              </div>
            </div>
            <div className="field">
              <label>Required average pace</label>
              <div className="control" style={{ padding: '12px 14px' }}>
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 24,
                    fontWeight: 600,
                    letterSpacing: '-0.01em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {Calc.fmtPace(paceShow)}{' '}
                  <span style={{ color: 'var(--muted)', fontSize: 14, fontWeight: 500 }}>
                    / {units}
                  </span>
                </span>
              </div>
            </div>
            <div className="field">
              <label>Equivalent VDOT</label>
              <div className="control" style={{ padding: '12px 14px' }}>
                <span
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: 30,
                    letterSpacing: '-0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {vdot ? vdot.toFixed(1) : '—'}
                </span>
              </div>
            </div>
          </div>
          {total > 0 && !realistic && (
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
              }}
            >
              That's faster than the marathon world record. Enter a more realistic goal time.
            </div>
          )}
        </div>
      </section>

      <section className="dashboard">
        <div className="shell">
          <div className="dash-head">
            <div>
              <div className="meta">Pacing</div>
              <h2>Every 5K split for {Calc.fmtTime(total)}</h2>
            </div>
          </div>
          <div className="grid-12">
            <div className="card col-12">
              <div className="card-label">Even-pace strategy</div>
              <div className="splits-grid">
                {display.map((s, i) => {
                  const km = units === 'km' ? s.km : Calc.kmToMi(s.km);
                  const isHalf = Math.abs(s.km - 21.0975) < 0.001;
                  const isFull = Math.abs(s.km - 42.195) < 0.001;
                  return (
                    <div
                      key={i}
                      className={'split-cell' + ((isHalf || isFull) ? ' milestone' : '')}
                    >
                      <div className="km">
                        {isHalf
                          ? 'HALF'
                          : isFull
                          ? 'FINISH'
                          : `${km.toFixed(km % 1 === 0 ? 0 : 1)} ${units}`}
                      </div>
                      <div className="t">{Calc.fmtTime(s.seconds)}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card col-6">
              <div className="card-label">Negative split (first half slower)</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--line)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>First half · 21.1 km</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      +30s/km slower than target
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600 }}>
                    {Calc.fmtTime(total / 2 + negSplitDelta)}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Second half · 21.1 km</div>
                    <div style={{ fontSize: 12, color: 'var(--accent)' }}>
                      30s/km faster · finish strong
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 600 }}>
                    {Calc.fmtTime(total / 2 - negSplitDelta)}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  Recommended for first-timers and warm conditions. Most marathon
                  records are run with negative splits.
                </div>
              </div>
            </div>

            <div className="card col-6">
              <div className="card-label">Course-corrected pacing</div>
              <div style={{ marginTop: 8 }}>
                {['0–10K', '10–21K', '21–32K', '32–42K'].map((seg, i) => {
                  const adj = [-3, 0, +5, +8][i];
                  const adjPace = paceSec + adj;
                  const adjShow = units === 'km' ? adjPace : Calc.pacePerKmToPerMi(adjPace);
                  return (
                    <div
                      key={seg}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        padding: '10px 0',
                        borderBottom: i < 3 ? '1px solid var(--line)' : 'none',
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{seg}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 16, fontWeight: 600 }}>
                        {Calc.fmtPace(adjShow)}
                        <span style={{ color: 'var(--muted)', fontSize: 11 }}>/{units}</span>
                      </div>
                    </div>
                  );
                })}
                <div
                  style={{
                    fontSize: 13,
                    color: 'var(--muted)',
                    marginTop: 12,
                    lineHeight: 1.6,
                  }}
                >
                  The "wall" is real. Bank a small cushion in the first half,
                  hold steady through 21–32K, then survive 32–42K.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="trust">
        <div className="shell">
          <div className="section-head">
            <div>
              <div className="kicker">Benchmarks</div>
              <h2 style={{ fontSize: 44 }}>How does your goal stack up?</h2>
            </div>
          </div>
          <div className="grid-12">
            {benchmarks.map((b) => {
              const sec = Calc.parseTime(b.h, b.m, b.s);
              const isYours = Math.abs(sec - total) < 60;
              const benchmarkPaceKm = sec / 42.195;
              const benchmarkPaceShow =
                units === 'km' ? benchmarkPaceKm : Calc.pacePerKmToPerMi(benchmarkPaceKm);
              return (
                <div
                  key={b.label}
                  className={'card ' + (isYours ? 'accent' : '') + ' col-12'}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr auto',
                    alignItems: 'baseline',
                    gap: 24,
                    padding: '18px 22px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: 30,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {b.label}
                  </div>
                  <div
                    style={{
                      color: isYours ? 'var(--accent-ink)' : 'var(--muted)',
                      fontSize: 13,
                    }}
                  >
                    {b.who}
                    {isYours && ' · matches your goal'}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 16,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {Calc.fmtPace(benchmarkPaceShow)}/{units}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export function VO2Page() {
  const [raceId, setRaceId] = useState('5k');
  const [t, setT] = useState({ h: 0, m: 22, s: 0 });
  const race = Calc.RACES.find((r) => r.id === raceId);
  const total = Calc.parseTime(t.h, t.m, t.s);
  const vo2 = total > 0 ? Calc.vo2Max(race.meters, total) : 0;
  const vdot = total > 0 ? Calc.vdotFromRace(race.meters, total) : 0;

  const ageBands = [
    { age: '20-29', men: 48, women: 41 },
    { age: '30-39', men: 45, women: 38 },
    { age: '40-49', men: 42, women: 35 },
    { age: '50-59', men: 39, women: 32 },
    { age: '60+', men: 35, women: 29 },
  ];

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">VO₂ Max · ml / kg / min</div>
          <h1>
            Estimate your <em>aerobic ceiling</em>.
          </h1>
          <p className="lede">
            VO₂ max is the maximum oxygen your body can use during exercise.
            We estimate it from a race performance using established sports-science formulas —
            no lab test required.
          </p>
        </div>
      </section>

      <section className="workspace">
        <div className="shell">
          <div className="input-row">
            <div className="field">
              <label>Recent race</label>
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
        </div>
      </section>

      <section className="dashboard">
        <div className="shell">
          <div className="grid-12">
            <div className="card solid col-6">
              <div className="card-label">Estimated VO₂ Max</div>
              <div className="big-number">
                {vo2 ? vo2.toFixed(1) : '—'}
                <span className="unit">ML/KG/MIN</span>
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: '1px solid #2A2620',
                }}
              >
                A lab test (treadmill, gas mask) is the gold standard, but field
                estimates from race performance are accurate within ~5% for
                experienced runners.
              </div>
            </div>
            <div className="card col-6">
              <div className="card-label">Equivalent VDOT score</div>
              <div className="big-number">{vdot ? vdot.toFixed(1) : '—'}</div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'var(--muted)',
                  marginTop: 24,
                  paddingTop: 20,
                  borderTop: '1px solid var(--line)',
                }}
              >
                VDOT is the running-specific cousin of VO₂ max. It factors in
                running economy, so it's more useful for setting training paces.
                Use the home workspace to get your full pace zones.
              </div>
            </div>
            <div className="card col-12">
              <div className="card-label">Where you sit · age-graded reference</div>
              <div style={{ overflowX: 'auto' }}>
                <table
                  style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}
                  aria-label="VO2 max by age band, men vs women, with your delta"
                >
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--line)' }}>
                      <th
                        style={{
                          textAlign: 'left',
                          padding: '12px 8px',
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: 'var(--muted)',
                        }}
                      >
                        AGE BAND
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '12px 8px',
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: 'var(--muted)',
                        }}
                      >
                        AVG MEN
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '12px 8px',
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: 'var(--muted)',
                        }}
                      >
                        AVG WOMEN
                      </th>
                      <th
                        style={{
                          textAlign: 'right',
                          padding: '12px 8px',
                          fontFamily: 'var(--mono)',
                          fontSize: 11,
                          letterSpacing: '0.12em',
                          color: 'var(--muted)',
                        }}
                      >
                        YOU
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ageBands.map((b) => (
                      <tr key={b.age} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td
                          style={{
                            padding: '14px 8px',
                            fontFamily: 'var(--display)',
                            fontSize: 20,
                          }}
                        >
                          {b.age}
                        </td>
                        <td
                          style={{
                            padding: '14px 8px',
                            textAlign: 'right',
                            fontFamily: 'var(--mono)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {b.men.toFixed(1)}
                        </td>
                        <td
                          style={{
                            padding: '14px 8px',
                            textAlign: 'right',
                            fontFamily: 'var(--mono)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {b.women.toFixed(1)}
                        </td>
                        <td
                          style={{
                            padding: '14px 8px',
                            textAlign: 'right',
                            fontFamily: 'var(--mono)',
                            fontWeight: 600,
                            color: vo2 > b.men ? 'var(--accent)' : 'var(--muted)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {vo2 > b.men
                            ? `+${(vo2 - b.men).toFixed(1)}`
                            : vo2 > 0
                            ? `${(vo2 - b.men).toFixed(1)}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const FORMSPREE_URL = 'https://formspree.io/f/xbdzvold';

export function ContactPage() {
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg(null);
    try {
      const res = await fetch(FORMSPREE_URL, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(e.currentTarget),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data?.errors?.map((x) => x.message).join(', ') ||
          `Send failed (status ${res.status}).`;
        setErrorMsg(msg);
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch (err) {
      setErrorMsg('Network error. Check your connection and try again.');
      setStatus('error');
    }
  };

  const sent = status === 'sent';
  const sending = status === 'sending';

  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">Contact</div>
          <h1>
            Found a <em>bug</em> or want a
            <br />
            new calculator?
          </h1>
          <p className="lede">
            Tools should serve runners, not the other way around. Drop a note
            below — every message is read by a human.
          </p>
        </div>
      </section>
      <section className="dashboard">
        <div className="shell" style={{ maxWidth: 720 }}>
          <div className="card" style={{ padding: 32 }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontFamily: 'var(--display)', fontSize: 48, marginBottom: 12 }}>
                  Thanks.
                </div>
                <div style={{ color: 'var(--muted)' }}>
                  We'll get back to you within a few days.
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit}>
                <div className="field" style={{ marginBottom: 18 }}>
                  <label>Your email</label>
                  <div className="control">
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@example.com"
                      disabled={sending}
                    />
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 18 }}>
                  <label>What's up?</label>
                  <div className="control">
                    <select name="topic" required defaultValue="" disabled={sending}>
                      <option value="" disabled>
                        Pick one
                      </option>
                      <option>Bug report</option>
                      <option>Feature request</option>
                      <option>Coach / partnership</option>
                      <option>Something else</option>
                    </select>
                  </div>
                </div>
                <div className="field" style={{ marginBottom: 22 }}>
                  <label>Message</label>
                  <div className="control" style={{ padding: 4 }}>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      disabled={sending}
                      style={{
                        background: 'transparent',
                        border: 0,
                        outline: 0,
                        padding: '12px 14px',
                        fontFamily: 'var(--sans)',
                        fontSize: 15,
                        width: '100%',
                        color: 'var(--ink)',
                        resize: 'vertical',
                      }}
                      placeholder="Tell us what you're trying to do."
                    ></textarea>
                  </div>
                </div>
                {errorMsg && (
                  <div
                    role="alert"
                    style={{
                      marginBottom: 16,
                      padding: '10px 14px',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent-ink)',
                      border: '1px solid var(--accent-line)',
                      borderRadius: 10,
                      fontSize: 13,
                    }}
                  >
                    {errorMsg}
                  </div>
                )}
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Sending…' : 'Send message'}{' '}
                  {!sending && <span className="arrow">→</span>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

export function GuidePage() {
  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">The Guide · Training science</div>
          <h1>
            How to <em>actually</em> use
            <br />
            these calculators.
          </h1>
          <p className="lede">
            Short, no-fluff explanations of the formulas behind every tool —
            and how to apply them to your training week.
          </p>
        </div>
      </section>
      <section className="dashboard">
        <div className="shell">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: 48 }}>
            <aside className="guide-toc">
              <h4>Contents</h4>
              <a href="#what-is-vdot">What is VDOT?</a>
              <a href="#pace-zones">The 5 pace zones</a>
              <a href="#race-pred">Race predictions</a>
              <a href="#hr-zones">Heart rate zones</a>
              <a href="#weekly">A weekly framework</a>
              <a href="#refs">References</a>
            </aside>
            <article className="prose">
              <h2 id="what-is-vdot">What is VDOT?</h2>
              <p>
                <strong>VDOT</strong> is a single number that captures your current running fitness.
                Developed by Jack Daniels, PhD, it's derived from a race performance — your pace,
                duration, and the physiological cost of running that distance — and correlates closely with
                lab-tested VO₂ max while accounting for running economy.
              </p>
              <p>
                A 20-year-old elite male might run an 80+ VDOT. A first-time 5K runner might
                start in the high 20s. The number itself doesn't matter — the point is to convert it
                back into <em>training paces</em>.
              </p>

              <h2 id="pace-zones">The five pace zones</h2>
              <p>Daniels' framework slices your training paces by the physiological adaptation each one targets:</p>
              <ul>
                <li>
                  <strong>Easy (E)</strong> — 59–74% of VO₂ max. The bulk of weekly mileage. Builds capillary
                  density and mitochondrial mass.
                </li>
                <li>
                  <strong>Marathon (M)</strong> — 75–84%. Sustainable for 26.2 mi. Improves glycogen efficiency.
                </li>
                <li>
                  <strong>Threshold (T)</strong> — 83–88%. The fastest pace you can hold for ~1 hour. Improves
                  lactate clearance.
                </li>
                <li>
                  <strong>Interval (I)</strong> — 95–100%. VO₂ max work. Roughly 5K race pace.
                </li>
                <li>
                  <strong>Repetition (R)</strong> — 105–120%. Short, fast reps. Improves running economy and
                  neuromuscular power.
                </li>
              </ul>

              <h2 id="race-pred">How accurate are race predictions?</h2>
              <p>
                We use <strong>Riegel's formula</strong>: T₂ = T₁ × (D₂/D₁)^1.06. It works because running gets
                a little slower as distances get longer, in a fairly predictable way. The 1.06 exponent
                holds well for trained runners between 5K and the marathon. It tends to over-predict for
                undertrained runners stepping up to the marathon — your weekly mileage matters as much
                as your 10K time.
              </p>

              <h2 id="hr-zones">Heart rate zones — two methods</h2>
              <p>
                Simpler: <strong>% of max HR</strong>. Easy = 50–60%, Aerobic = 60–70%, and so on up to VO₂ max at 90–100%.
              </p>
              <p>
                More accurate: <strong>Karvonen</strong>, which uses heart-rate reserve (max minus resting).
                If you know your resting HR, use it — the zones get more personalized, especially for
                fit athletes with low resting heart rates.
              </p>

              <h2 id="weekly">A weekly framework</h2>
              <ul>
                <li>
                  <strong>Monday</strong> · Easy + strides
                </li>
                <li>
                  <strong>Tuesday</strong> · Quality (intervals or repetitions)
                </li>
                <li>
                  <strong>Wednesday</strong> · Easy
                </li>
                <li>
                  <strong>Thursday</strong> · Threshold or tempo
                </li>
                <li>
                  <strong>Friday</strong> · Easy or rest
                </li>
                <li>
                  <strong>Saturday</strong> · Easy + strides
                </li>
                <li>
                  <strong>Sunday</strong> · Long run (some at marathon pace if training for one)
                </li>
              </ul>
              <p>
                <strong>80/20 rule:</strong> ~80% of weekly minutes at Easy, ~20% at Threshold and above.
                Most amateurs get this backwards.
              </p>

              <h2 id="refs">References</h2>
              <ul>
                <li>Daniels, J. (2014). <em>Daniels' Running Formula</em>, 3rd ed. Human Kinetics.</li>
                <li>
                  Riegel, P. (1981). Athletic records and human endurance.{' '}
                  <em>American Scientist</em>, 69, 285–290.
                </li>
                <li>
                  Karvonen, M. J. (1957). The effects of training on heart rate.{' '}
                  <em>Annales Medicinae Experimentalis et Biologiae Fenniae</em>, 35, 307–315.
                </li>
                <li>
                  Seiler, S. (2010). What is best practice for training intensity distribution?{' '}
                  <em>IJSPP</em>, 5(3), 276–291.
                </li>
              </ul>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
