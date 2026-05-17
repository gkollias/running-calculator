// Calculation engine.
// Formulas: Jack Daniels VDOT, Riegel race prediction, Karvonen HR, MET-based calories.

export function fmtPace(secondsPer) {
  if (!isFinite(secondsPer) || secondsPer <= 0) return '—:—';
  const m = Math.floor(secondsPer / 60);
  const s = Math.round(secondsPer % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function fmtTime(seconds) {
  if (!isFinite(seconds) || seconds <= 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function parseTime(h, m, s) {
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
}

export function vdotFromRace(meters, totalSeconds) {
  const totalMin = totalSeconds / 60;
  const v = meters / totalMin;
  const vo2 = -4.6 + 0.182258 * v + 0.000104 * v * v;
  const pct =
    0.8 +
    0.1894393 * Math.exp(-0.012778 * totalMin) +
    0.2989558 * Math.exp(-0.1932605 * totalMin);
  return vo2 / pct;
}

function velocityFromVO2(vo2) {
  const a = 0.000104,
    b = 0.182258,
    c = -4.6 - vo2;
  return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a);
}

export function paceFromVDOT(vdot, pct) {
  const v = velocityFromVO2(vdot * pct);
  return (1000 / v) * 60;
}

export function trainingPaces(vdot) {
  return {
    easy: { min: paceFromVDOT(vdot, 0.74), max: paceFromVDOT(vdot, 0.59) },
    marathon: { min: paceFromVDOT(vdot, 0.84), max: paceFromVDOT(vdot, 0.75) },
    threshold: { min: paceFromVDOT(vdot, 0.88), max: paceFromVDOT(vdot, 0.83) },
    interval: { min: paceFromVDOT(vdot, 0.98), max: paceFromVDOT(vdot, 0.95) },
    repetition: { min: paceFromVDOT(vdot, 1.2), max: paceFromVDOT(vdot, 1.05) },
  };
}

export function predictRace(knownMeters, knownSeconds, targetMeters) {
  return knownSeconds * Math.pow(targetMeters / knownMeters, 1.06);
}

export function predictAll(knownMeters, knownSeconds) {
  const distances = [
    { name: '1 mile', meters: 1609.34 },
    { name: '5K', meters: 5000 },
    { name: '10K', meters: 10000 },
    { name: 'Half Marathon', meters: 21097.5 },
    { name: 'Marathon', meters: 42195 },
  ];
  return distances.map((d) => ({
    ...d,
    seconds: predictRace(knownMeters, knownSeconds, d.meters),
    isKnown: Math.abs(d.meters - knownMeters) < 1,
  }));
}

export function splits(paceSecPerKm, distanceKm) {
  const milestones = [1, 5, 10, 15, 20, 21.0975, 25, 30, 35, 40, 42.195];
  const result = [];
  for (let km = 1; km <= Math.floor(distanceKm); km++) {
    const isMilestone = milestones.some((m) => Math.abs(m - km) < 0.001);
    result.push({ km, seconds: km * paceSecPerKm, milestone: isMilestone });
  }
  if (distanceKm % 1 > 0.01) {
    result.push({
      km: distanceKm,
      seconds: distanceKm * paceSecPerKm,
      milestone: true,
      final: true,
    });
  }
  return result;
}

export function hrZones(maxHR, restHR) {
  const zones = [
    { name: 'Easy', desc: 'Recovery, warm-up', min: 0.5, max: 0.6 },
    { name: 'Aerobic', desc: 'Long-run base', min: 0.6, max: 0.7 },
    { name: 'Tempo', desc: 'Marathon effort', min: 0.7, max: 0.8 },
    { name: 'Threshold', desc: 'Comfortable hard', min: 0.8, max: 0.9 },
    { name: 'VO₂ Max', desc: 'Maximum effort', min: 0.9, max: 1.0 },
  ];
  return zones.map((z) => {
    let lo, hi;
    if (restHR && restHR > 0) {
      const res = maxHR - restHR;
      lo = Math.round(restHR + res * z.min);
      hi = Math.round(restHR + res * z.max);
    } else {
      lo = Math.round(maxHR * z.min);
      hi = Math.round(maxHR * z.max);
    }
    return { ...z, lo, hi };
  });
}

export function maxHREstimate(age) {
  return 220 - (age || 35);
}

export function calories(weightKg, distanceKm, timeMinutes) {
  const speed = (distanceKm / timeMinutes) * 60;
  let met;
  if (speed < 6.4) met = 6.0;
  else if (speed < 8.0) met = 8.3;
  else if (speed < 9.7) met = 9.8;
  else if (speed < 11.3) met = 11.0;
  else if (speed < 12.9) met = 12.8;
  else if (speed < 14.5) met = 14.5;
  else if (speed < 16.1) met = 16.0;
  else met = 19.0;

  const cal = met * weightKg * (timeMinutes / 60);
  const simple = weightKg * distanceKm;
  return {
    speed,
    met,
    met_calories: Math.round(cal),
    simple_calories: Math.round(simple),
    average: Math.round((cal + simple) / 2),
  };
}

export function vo2Max(meters, totalSeconds) {
  const totalMin = totalSeconds / 60;
  const v = meters / totalMin;
  return -4.6 + 0.182258 * v + 0.000104 * v * v;
}

export function kmToMi(km) {
  return km * 0.621371;
}
export function miToKm(mi) {
  return mi / 0.621371;
}
export function pacePerKmToPerMi(sec) {
  return sec / 0.621371;
}

export const RACES = [
  { id: '1mile', name: '1 Mile', meters: 1609.34 },
  { id: '5k', name: '5K', meters: 5000 },
  { id: '10k', name: '10K', meters: 10000 },
  { id: 'half', name: 'Half Marathon', meters: 21097.5 },
  { id: 'marathon', name: 'Marathon', meters: 42195 },
];

export const Calc = {
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
  maxHREstimate,
  calories,
  vo2Max,
  kmToMi,
  miToKm,
  pacePerKmToPerMi,
  RACES,
};
