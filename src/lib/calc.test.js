import { describe, it, expect } from 'vitest';
import {
  fmtPace,
  fmtTime,
  parseTime,
  vdotFromRace,
  paceFromVDOT,
  trainingPaces,
  predictRace,
  predictAll,
  splits,
  hrZones,
  calories,
  vo2Max,
  kmToMi,
  miToKm,
  pacePerKmToPerMi,
  RACES,
  DEFAULT_TIMES,
  MIN_SECONDS,
  isTimeRealistic,
} from './calc.js';

describe('fmtPace', () => {
  it('formats whole-second paces', () => {
    expect(fmtPace(300)).toBe('5:00'); // 5:00/km
    expect(fmtPace(330)).toBe('5:30');
  });
  it('rounds sub-second paces', () => {
    expect(fmtPace(300.4)).toBe('5:00');
    expect(fmtPace(300.6)).toBe('5:01');
  });
  it('returns an em-dash fallback for invalid input', () => {
    expect(fmtPace(0)).toBe('—:—');
    expect(fmtPace(-5)).toBe('—:—');
    expect(fmtPace(NaN)).toBe('—:—');
    expect(fmtPace(Infinity)).toBe('—:—');
  });
});

describe('fmtTime', () => {
  it('formats sub-hour times as MM:SS', () => {
    expect(fmtTime(0 * 60 + 59)).toBe('0:59');
    expect(fmtTime(45 * 60)).toBe('45:00');
    expect(fmtTime(59 * 60 + 59)).toBe('59:59');
  });
  it('formats hour+ times as H:MM:SS', () => {
    expect(fmtTime(3600)).toBe('1:00:00');
    expect(fmtTime(2 * 3600 + 5 * 60 + 30)).toBe('2:05:30');
  });
  it('returns an em-dash fallback for invalid input', () => {
    expect(fmtTime(0)).toBe('—');
    expect(fmtTime(NaN)).toBe('—');
    expect(fmtTime(Infinity)).toBe('—');
  });
});

describe('parseTime', () => {
  it('combines h/m/s into total seconds', () => {
    expect(parseTime(0, 0, 0)).toBe(0);
    expect(parseTime(0, 1, 0)).toBe(60);
    expect(parseTime(1, 0, 0)).toBe(3600);
    expect(parseTime(2, 30, 15)).toBe(2 * 3600 + 30 * 60 + 15);
  });
  it('tolerates string inputs from form fields', () => {
    expect(parseTime('1', '30', '0')).toBe(5400);
  });
  it('handles missing/junk components as zero', () => {
    expect(parseTime(undefined, 5, null)).toBe(300);
    expect(parseTime('abc', '10', '')).toBe(600);
  });
});

describe('vdotFromRace', () => {
  // Reference values from Daniels' VDOT tables (approximate; the formula is
  // a regression so we tolerate ±0.5 against published table values).
  it('approximates known VDOT for 5K performances', () => {
    const v50 = vdotFromRace(5000, 19 * 60 + 57); // ~5K @ 19:57 → VDOT ~50
    expect(v50).toBeGreaterThan(49.5);
    expect(v50).toBeLessThan(50.5);
  });
  it('approximates known VDOT for 10K performances', () => {
    const v40 = vdotFromRace(10000, 50 * 60 + 19); // ~10K @ 50:19 → VDOT ~40
    expect(v40).toBeGreaterThan(39.5);
    expect(v40).toBeLessThan(40.5);
  });
  it('produces monotonically increasing VDOT for faster times at same distance', () => {
    const slow = vdotFromRace(10000, 60 * 60);
    const fast = vdotFromRace(10000, 40 * 60);
    expect(fast).toBeGreaterThan(slow);
  });
});

describe('paceFromVDOT / trainingPaces', () => {
  it('returns slower paces for lower-intensity zones', () => {
    const zones = trainingPaces(50);
    expect(zones.easy.max).toBeGreaterThan(zones.marathon.max);
    expect(zones.marathon.max).toBeGreaterThan(zones.threshold.max);
    expect(zones.threshold.max).toBeGreaterThan(zones.interval.max);
    expect(zones.interval.max).toBeGreaterThan(zones.repetition.max);
  });
  it('returns the same 5 zone keys', () => {
    expect(Object.keys(trainingPaces(50))).toEqual([
      'easy',
      'marathon',
      'threshold',
      'interval',
      'repetition',
    ]);
  });
});

describe('predictRace (Riegel)', () => {
  it('predicts a longer race as slower than a linear scale', () => {
    // 5K in 20:00 → 10K via T2 = T1*(D2/D1)^1.06 = 20min * 2^1.06 ≈ 41:42
    const t = predictRace(5000, 20 * 60, 10000);
    expect(t).toBeGreaterThan(40 * 60);
    expect(t).toBeLessThan(43 * 60);
  });
  it('round-trips to the input time at the input distance', () => {
    const t = predictRace(5000, 1200, 5000);
    expect(t).toBeCloseTo(1200, 5);
  });
});

describe('predictAll', () => {
  it('returns the five standard distances', () => {
    const preds = predictAll(10000, 50 * 60);
    expect(preds.map((p) => p.name)).toEqual([
      '1 mile',
      '5K',
      '10K',
      'Half Marathon',
      'Marathon',
    ]);
  });
  it('flags the known input distance with isKnown', () => {
    const preds = predictAll(10000, 50 * 60);
    expect(preds.find((p) => p.name === '10K').isKnown).toBe(true);
    expect(preds.find((p) => p.name === '5K').isKnown).toBe(false);
  });
});

describe('splits', () => {
  it('generates one row per whole km plus a final partial', () => {
    const s = splits(300, 5.5); // 5.5 km @ 5:00/km
    expect(s).toHaveLength(6); // 5 whole + 1 final
    expect(s[5].final).toBe(true);
    expect(s[5].km).toBe(5.5);
  });
  it('does not add a final row when distance is whole km', () => {
    const s = splits(300, 5);
    expect(s).toHaveLength(5);
    expect(s.some((x) => x.final)).toBe(false);
  });
  it('flags milestone km (1, 5, 10, half, marathon, etc.)', () => {
    const s = splits(300, 10);
    expect(s.find((x) => x.km === 1).milestone).toBe(true);
    expect(s.find((x) => x.km === 5).milestone).toBe(true);
    expect(s.find((x) => x.km === 10).milestone).toBe(true);
    expect(s.find((x) => x.km === 7).milestone).toBe(false);
  });
});

describe('hrZones', () => {
  it('returns 5 zones with lo/hi ranges', () => {
    const z = hrZones(190, null);
    expect(z).toHaveLength(5);
    z.forEach((zone) => {
      expect(zone.lo).toBeLessThan(zone.hi);
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('desc');
    });
  });
  it('% of max method: zone-1 lo is 50% of max', () => {
    const z = hrZones(200, null);
    expect(z[0].lo).toBe(100); // 200 * 0.50
    expect(z[4].hi).toBe(200); // 200 * 1.00
  });
  it('Karvonen method: uses heart-rate reserve when restHR provided', () => {
    // max 200, rest 60 → reserve 140; zone-1 lo = 60 + 140*0.5 = 130
    const z = hrZones(200, 60);
    expect(z[0].lo).toBe(130);
    expect(z[4].hi).toBe(200);
  });
});

describe('calories', () => {
  it('selects correct MET tier by speed', () => {
    // 70kg, 5km in 30min = 10 km/h → tier 11.0 (9.7 ≤ v < 11.3)
    expect(calories(70, 5, 30).met).toBe(11.0);
    // 70kg, 10km in 60min = 10 km/h → still tier 11.0
    expect(calories(70, 10, 60).met).toBe(11.0);
    // Very slow 5 km/h → tier 6.0 (< 6.4)
    expect(calories(70, 5, 60).met).toBe(6.0);
  });
  it('returns the average of MET and simple methods', () => {
    const c = calories(70, 10, 60);
    expect(c.average).toBe(Math.round((c.met_calories + c.simple_calories) / 2));
  });
});

describe('vo2Max', () => {
  // The function returns the VO2 cost of running at the race pace, not the
  // athlete's VO2 max (vdotFromRace divides this by the sustainable-intensity
  // percentage for that duration to get VDOT). A 20-min 5K at 250 m/min →
  // -4.6 + 0.182258*250 + 0.000104*250² ≈ 47.46 ml/kg/min.
  it('matches the Daniels VO2-at-velocity formula for a 5K @ 20:00', () => {
    expect(vo2Max(5000, 20 * 60)).toBeCloseTo(47.46, 1);
  });
  it('increases with faster race performances', () => {
    expect(vo2Max(5000, 18 * 60)).toBeGreaterThan(vo2Max(5000, 22 * 60));
  });
});

describe('unit helpers', () => {
  it('km ↔ mi round-trip', () => {
    expect(miToKm(kmToMi(10))).toBeCloseTo(10, 5);
  });
  it('pacePerKmToPerMi converts 5:00/km → 8:03/mi', () => {
    const perMi = pacePerKmToPerMi(300); // 300s/km
    expect(perMi).toBeGreaterThan(8 * 60); // > 8:00/mi
    expect(perMi).toBeLessThan(8 * 60 + 15); // < 8:15/mi
  });
});

describe('RACES + DEFAULT_TIMES + MIN_SECONDS', () => {
  it('every race id has a default time and a WR floor', () => {
    RACES.forEach((r) => {
      expect(DEFAULT_TIMES[r.id]).toBeDefined();
      expect(MIN_SECONDS[r.id]).toBeGreaterThan(0);
    });
  });
});

describe('isTimeRealistic', () => {
  it('blocks times faster than the WR floor', () => {
    expect(isTimeRealistic('marathon', 60 * 60)).toBe(false); // 1h marathon
    expect(isTimeRealistic('5k', 5 * 60)).toBe(false); // 5min 5K
  });
  it('allows realistic times', () => {
    expect(isTimeRealistic('marathon', 4 * 3600)).toBe(true); // 4h marathon
    expect(isTimeRealistic('5k', 25 * 60)).toBe(true); // 25min 5K
    expect(isTimeRealistic('10k', 50 * 60)).toBe(true);
  });
  it('allows times right at the floor', () => {
    Object.keys(MIN_SECONDS).forEach((id) => {
      expect(isTimeRealistic(id, MIN_SECONDS[id])).toBe(true);
    });
  });
});
