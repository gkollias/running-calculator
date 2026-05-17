// Per-tool landing pages. Each has its own URL so it can rank independently
// for its target keyword. Structure per page:
//   hero (kicker + h1 with the keyword + lede)
//   the tool component itself (reused from src/tools.jsx)
//   prose body (~200–400 words: the formula, how to use, when to use)
//   "Related calculators" links for internal cross-navigation.

import React from 'react';
import {
  ToolPace,
  ToolSplits,
  ToolHR,
  ToolPredict,
  ToolCalorie,
  ToolVDOT,
  TOOLS,
} from './tools.jsx';

function RelatedTools({ currentId, onNavigate }) {
  const others = TOOLS.filter((t) => t.id !== currentId).slice(0, 4);
  return (
    <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--line)' }}>
      <div className="kicker" style={{ marginBottom: 14 }}>
        Related calculators
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {others.map((t) => (
          <a
            key={t.id}
            href={t.path}
            className="btn-ghost"
            onClick={(e) => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate(t.id);
              }
            }}
          >
            {t.title} →
          </a>
        ))}
      </div>
    </div>
  );
}

function ToolPageShell({ kicker, title, em, lede, children, currentId, onNavigate }) {
  return (
    <main>
      <section className="hero">
        <div className="shell">
          <div className="kicker">{kicker}</div>
          <h1>
            {title} <em>{em}</em>
          </h1>
          <p className="lede">{lede}</p>
        </div>
      </section>
      <section className="workspace">
        <div className="shell">{children}</div>
      </section>
    </main>
  );
}

function ProseSection({ children, currentId, onNavigate }) {
  return (
    <section className="dashboard">
      <div className="shell">
        <article className="prose">
          {children}
          <RelatedTools currentId={currentId} onNavigate={onNavigate} />
        </article>
      </div>
    </section>
  );
}

// ─── /pace ───────────────────────────────────────────────────────────────
export function PacePage({ units, onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="Pace · convert distance, time, pace"
        title="Pace"
        em="calculator"
        lede="Convert any two of distance, time, and pace to the third. Switch instantly between km and miles — for training pace, race targets, or workout planning."
      >
        <ToolPace units={units} />
      </ToolPageShell>
      <ProseSection currentId="pace" onNavigate={onNavigate}>
        <h2>What does this pace calculator do?</h2>
        <p>
          Enter two of the three values — <strong>distance</strong>, <strong>time</strong>,
          or <strong>pace</strong> — and the calculator returns the third. It's the
          most-used running calculator: figuring out the average pace of last
          Saturday's long run, the time required to hit a target pace over 10K,
          or the distance you can cover in a 45-minute workout.
        </p>
        <p>
          Pace can be expressed two ways: <strong>minutes per kilometer</strong> (used in
          Europe, Australia, and most international races) or{' '}
          <strong>minutes per mile</strong> (the standard in the US and UK). The unit toggle
          in the top nav switches every output instantly — your inputs are
          re-interpreted in whichever unit you've selected.
        </p>

        <h2>How to use it</h2>
        <ul>
          <li>Enter the distance you ran (or plan to run).</li>
          <li>Enter the time it took (or your goal time).</li>
          <li>Read off the pace, plus your average speed in both km/h and mph.</li>
        </ul>

        <h2>Why pace matters in training</h2>
        <p>
          Almost every structured running plan prescribes work in pace zones rather
          than perceived effort: <em>"5×1K at threshold pace, 90 sec recovery."</em>{' '}
          Knowing your current pace for each zone — Easy, Marathon, Threshold,
          Interval, Repetition — is the difference between hitting the target adaptation
          and overcooking the workout. The{' '}
          <a href="/vdot" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('vdot'); } }}>
            VDOT calculator
          </a>{' '}
          turns a recent race into your personal pace zones; this page is the simpler
          conversion tool for everyday math.
        </p>
      </ProseSection>
    </>
  );
}

// ─── /splits ─────────────────────────────────────────────────────────────
export function SplitsPage({ units, onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="Splits · per-km / per-mile breakdown"
        title="Race splits"
        em="calculator"
        lede="Generate kilometer or mile splits for any target pace and race distance. Print as a race-day cheat sheet so you can hit each marker on pace."
      >
        <ToolSplits units={units} />
      </ToolPageShell>
      <ProseSection currentId="splits" onNavigate={onNavigate}>
        <h2>What is a race splits calculator?</h2>
        <p>
          A <strong>splits calculator</strong> tells you what time you should be passing
          each kilometer or mile marker if you want to finish on pace. Enter your target
          pace and the race distance (5K, 10K, half marathon, marathon) and the table
          shows every km / mile target plus the finish.
        </p>
        <p>
          For races up to 10K, every kilometer is shown. For longer races we collapse
          to 5K segments after the first 10K to keep the cheat sheet readable.
        </p>

        <h2>Even pace vs. negative split</h2>
        <p>
          The splits in this calculator assume <strong>even pacing</strong> — same
          target every km. That's the simplest strategy and good enough for most races
          under 10K. For the marathon, most world records have been run with a slight
          <strong> negative split</strong> (second half faster than the first). The{' '}
          <a href="/marathon" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('marathon'); } }}>
            marathon pacing strategy page
          </a>{' '}
          breaks that down further.
        </p>

        <h2>Race-day tip</h2>
        <p>
          Print the splits or screenshot them on your phone before the race. Most GPS
          watches drift slightly long over a measured course — comparing your watch
          time at each official marker (rather than each watch-km) keeps you on real
          pace.
        </p>
      </ProseSection>
    </>
  );
}

// ─── /heart-rate-zones ───────────────────────────────────────────────────
export function HRPage({ onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="Heart rate · % max + Karvonen"
        title="Heart rate zone"
        em="calculator"
        lede="Calculate your five training heart-rate zones using either % of max HR or the Karvonen heart-rate-reserve method. Add a resting HR for the more personalized Karvonen calculation."
      >
        <ToolHR />
      </ToolPageShell>
      <ProseSection currentId="hr" onNavigate={onNavigate}>
        <h2>What is a heart rate zone calculator?</h2>
        <p>
          A heart rate zone calculator turns your <strong>max HR</strong> (and optionally
          your <strong>resting HR</strong>) into five training intensity ranges:
        </p>
        <ul>
          <li><strong>Zone 1 — Easy</strong>: recovery and warm-up. 50–60% of max.</li>
          <li><strong>Zone 2 — Aerobic</strong>: long-run base building. 60–70%.</li>
          <li><strong>Zone 3 — Tempo</strong>: marathon-effort steady work. 70–80%.</li>
          <li><strong>Zone 4 — Threshold</strong>: comfortable hard. 80–90%.</li>
          <li><strong>Zone 5 — VO₂ Max</strong>: max effort intervals. 90–100%.</li>
        </ul>

        <h2>% of max HR vs. Karvonen</h2>
        <p>
          The simpler method just multiplies your max HR by each zone's percentage.
          The <strong>Karvonen formula</strong> uses your <strong>heart-rate reserve</strong>{' '}
          (max minus resting), which produces more personalized zones — especially
          for fit athletes with low resting heart rates, where percentage-of-max can
          underestimate the work zones.
        </p>
        <p>
          If you know your resting HR (take it first thing in the morning, lying down,
          for a few days running and average), enter it for the Karvonen calculation.
          Otherwise leave it blank for the percentage method.
        </p>

        <h2>How does this relate to pace training?</h2>
        <p>
          Pace zones and heart-rate zones are two views of the same training load. On
          a flat day in cool weather they agree closely; in heat, on hills, or when
          tired, heart rate is the more honest signal. Many runners use{' '}
          <a href="/vdot" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('vdot'); } }}>
            VDOT-derived pace zones
          </a>{' '}
          for hard workouts and HR zones for easy and long runs.
        </p>
      </ProseSection>
    </>
  );
}

// ─── /race-predictor ─────────────────────────────────────────────────────
export function PredictPage({ units, onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="Predictor · Riegel formula"
        title="Race time"
        em="predictor"
        lede="Project your time across 1 mile, 5K, 10K, half marathon, and marathon from any single race performance using Riegel's formula."
      >
        <ToolPredict units={units} />
      </ToolPageShell>
      <ProseSection currentId="predict" onNavigate={onNavigate}>
        <h2>How the race time predictor works</h2>
        <p>
          We use <strong>Riegel's formula</strong>:
          <code style={{ display: 'block', margin: '8px 0', fontFamily: 'var(--mono)' }}>
            T₂ = T₁ × (D₂/D₁)<sup>1.06</sup>
          </code>
          Where T₁ is your known time over distance D₁, and you want the predicted
          T₂ over distance D₂. The exponent <strong>1.06</strong> captures the fact that
          running gets a little slower as distances get longer.
        </p>

        <h2>How accurate is it?</h2>
        <p>
          For trained runners between 5K and the half marathon, Riegel predictions
          are typically within 1–3%. The formula tends to <strong>over-predict for
          undertrained runners stepping up to the marathon</strong> — your weekly mileage
          and long-run history matter as much as your 10K time. If you've never run
          more than 25K, take the marathon prediction with a grain of salt.
        </p>

        <h2>Pairs well with</h2>
        <p>
          Once you have an honest race time, the{' '}
          <a href="/vdot" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('vdot'); } }}>
            VDOT calculator
          </a>{' '}
          gives you full training paces for the next training block, and the{' '}
          <a href="/splits" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('splits'); } }}>
            splits calculator
          </a>{' '}
          turns the predicted goal into a race-day pacing plan.
        </p>
      </ProseSection>
    </>
  );
}

// ─── /calorie-calculator ─────────────────────────────────────────────────
export function CaloriePage({ units, onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="Calories · MET-based estimate"
        title="Running calorie"
        em="calculator"
        lede="Estimate calories burned on a run from weight, distance, and time. Uses MET values (the gold-standard metabolic-equivalent table), weighted with a simpler distance-based check."
      >
        <ToolCalorie units={units} />
      </ToolPageShell>
      <ProseSection currentId="calorie" onNavigate={onNavigate}>
        <h2>How are running calories estimated?</h2>
        <p>
          The most reliable field estimate combines two methods:
        </p>
        <ul>
          <li>
            <strong>MET method</strong>: based on metabolic equivalents from the
            Compendium of Physical Activities. A 10 km/h run is about 11 METs; faster
            paces have higher METs. Calories = MET × body weight (kg) × duration (h).
          </li>
          <li>
            <strong>Simple method</strong>: ~1 kcal per kg of body weight per km, a
            rough rule of thumb that's surprisingly close to lab measurements.
          </li>
        </ul>
        <p>
          We show both and report the average, which tends to track measured energy
          expenditure within ~10–15% for healthy adults running at typical training
          paces.
        </p>

        <h2>Why estimates vary</h2>
        <p>
          Wearables, gym treadmills, and online calculators frequently disagree by
          20–30%. Running economy, terrain, wind, fatigue, training status, and
          measurement methodology all contribute. Treat any single estimate as a
          ballpark — for nutrition planning, focus on trends across many runs rather
          than the exact number from one workout.
        </p>
      </ProseSection>
    </>
  );
}

// ─── /vdot ───────────────────────────────────────────────────────────────
export function VDOTPage({ onNavigate }) {
  return (
    <>
      <ToolPageShell
        kicker="VDOT · Jack Daniels formula"
        title="VDOT"
        em="calculator"
        lede="Compute your VDOT score from any race performance using Jack Daniels' formula. The single number that captures your current running fitness and unlocks personalized training paces."
      >
        <ToolVDOT />
      </ToolPageShell>
      <ProseSection currentId="vdot" onNavigate={onNavigate}>
        <h2>What is VDOT?</h2>
        <p>
          <strong>VDOT</strong> is a single number that summarizes your current running
          fitness. Developed by <strong>Jack Daniels, PhD</strong>, it's derived from a
          recent race result — your pace, duration, and the physiological cost of running
          that distance. It correlates closely with lab-tested{' '}
          <a href="/vo2" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('vo2'); } }}>
            VO₂ max
          </a>{' '}
          while accounting for running economy.
        </p>
        <p>
          A 20-year-old elite male might run an 80+ VDOT. A first-time 5K runner might
          start in the high 20s. Recreational runners typically sit between 30 and 55.
          The number itself doesn't matter — the point is to convert it back into
          training paces.
        </p>

        <h2>How to use VDOT in training</h2>
        <p>
          Daniels' framework slices training into five pace zones, each tied to a
          physiological adaptation:
        </p>
        <ul>
          <li><strong>Easy (E)</strong> — bulk of weekly mileage.</li>
          <li><strong>Marathon (M)</strong> — sustainable for 26.2 miles.</li>
          <li><strong>Threshold (T)</strong> — comfortable hard, ~1-hour race effort.</li>
          <li><strong>Interval (I)</strong> — VO₂ max work, ~5K race pace.</li>
          <li><strong>Repetition (R)</strong> — short, fast, full-recovery reps.</li>
        </ul>
        <p>
          Enter any race performance above to get your VDOT score; for the full pace
          zones in km or miles, use the{' '}
          <a href="/" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate('home'); } }}>
            home workspace
          </a>
          .
        </p>

        <h2>Re-test cadence</h2>
        <p>
          VDOT changes with fitness. Re-test after every race, or every 6–8 weeks during
          a training block using a hard tempo or time trial. Adjust your training paces
          when it shifts by 1.0 or more.
        </p>
      </ProseSection>
    </>
  );
}
