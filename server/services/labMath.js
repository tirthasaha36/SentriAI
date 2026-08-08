/**
 * Deterministic lab trend analysis.
 *
 * Everything here is arithmetic on purpose. A language model is used only to
 * turn messy report text into numbers; deciding whether a value is rising, and
 * whether it is heading out of range, must be reproducible and checkable.
 */

/**
 * Unit conversion to a canonical unit per marker. Different labs report the
 * same test in different units, which is exactly why comparing your own
 * reports across years is normally so hard.
 */
const CONVERSIONS = {
  glucose: { canonical: 'mg/dL', from: { 'mmol/l': (v) => v * 18.0182 } },
  cholesterol: { canonical: 'mg/dL', from: { 'mmol/l': (v) => v * 38.67 } },
  hdl: { canonical: 'mg/dL', from: { 'mmol/l': (v) => v * 38.67 } },
  ldl: { canonical: 'mg/dL', from: { 'mmol/l': (v) => v * 38.67 } },
  triglycerides: { canonical: 'mg/dL', from: { 'mmol/l': (v) => v * 88.57 } },
  creatinine: { canonical: 'mg/dL', from: { 'umol/l': (v) => v / 88.4, 'µmol/l': (v) => v / 88.4 } },
  hemoglobin: { canonical: 'g/dL', from: { 'g/l': (v) => v / 10 } },
  haemoglobin: { canonical: 'g/dL', from: { 'g/l': (v) => v / 10 } },
  bilirubin: { canonical: 'mg/dL', from: { 'umol/l': (v) => v / 17.1, 'µmol/l': (v) => v / 17.1 } },
};

const markerKey = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const findConversion = (name) => {
  const key = markerKey(name);
  const match = Object.keys(CONVERSIONS).find((c) => key.includes(c));
  return match ? CONVERSIONS[match] : null;
};

/** Convert a reading to the canonical unit for its marker where we know how. */
const normalise = (marker) => {
  const conv = findConversion(marker.name);
  const unit = String(marker.unit || '').toLowerCase().trim();
  if (!conv || !unit) return { ...marker, normalised: false };
  if (unit === conv.canonical.toLowerCase()) return { ...marker, unit: conv.canonical, normalised: false };

  const fn = conv.from[unit];
  if (!fn) return { ...marker, normalised: false };

  const convert = (v) => (typeof v === 'number' ? Number(fn(v).toFixed(2)) : v);
  return {
    ...marker,
    value: convert(marker.value),
    ref_low: convert(marker.ref_low),
    ref_high: convert(marker.ref_high),
    unit: conv.canonical,
    normalised: true,
    original_unit: marker.unit,
  };
};

/** Least-squares slope of value against days elapsed. */
const linearSlope = (points) => {
  const n = points.length;
  if (n < 2) return 0;
  const t0 = points[0].t;
  const xs = points.map((p) => (p.t - t0) / 86400000); // days
  const ys = points.map((p) => p.v);
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((acc, x, i) => acc + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((acc, x) => acc + (x - mx) ** 2, 0);
  return den === 0 ? 0 : num / den; // units per day
};

const statusOf = (value, low, high) => {
  if (typeof value !== 'number') return 'unknown';
  if (typeof low === 'number' && value < low) return 'below';
  if (typeof high === 'number' && value > high) return 'above';
  if (typeof low !== 'number' && typeof high !== 'number') return 'unknown';
  return 'normal';
};

/**
 * Where in the reference range a value sits, 0 = at the low bound,
 * 1 = at the high bound. This is what makes "still normal but drifting"
 * detectable at all.
 */
const positionInRange = (value, low, high) => {
  if (typeof value !== 'number' || typeof low !== 'number' || typeof high !== 'number') return null;
  if (high === low) return null;
  return (value - low) / (high - low);
};

const DRIFT_DAYS = 365;

/**
 * Group readings by marker and describe each one's trajectory.
 */
const analyseTrends = (reports) => {
  const byMarker = new Map();

  reports.forEach((report) => {
    const t = new Date(report.date).getTime();
    if (Number.isNaN(t)) return;
    (report.markers || []).forEach((raw) => {
      const m = normalise(raw);
      if (typeof m.value !== 'number') return;
      const key = markerKey(m.name);
      if (!byMarker.has(key)) byMarker.set(key, { name: m.name, unit: m.unit, points: [] });
      byMarker.get(key).points.push({ t, date: report.date, v: m.value, low: m.ref_low, high: m.ref_high, normalised: m.normalised, original_unit: m.original_unit });
    });
  });

  const results = [];

  byMarker.forEach((entry) => {
    const points = entry.points.sort((a, b) => a.t - b.t);
    const latest = points[points.length - 1];
    const first = points[0];

    const low = latest.low ?? first.low;
    const high = latest.high ?? first.high;
    const status = statusOf(latest.v, low, high);
    const slopePerDay = linearSlope(points);
    const spanDays = (latest.t - first.t) / 86400000;

    // Direction only means something with enough separation and movement.
    const totalChange = latest.v - first.v;
    const pctChange = first.v !== 0 ? (totalChange / Math.abs(first.v)) * 100 : 0;
    let direction = 'stable';
    if (points.length >= 2 && Math.abs(pctChange) >= 5) {
      direction = totalChange > 0 ? 'rising' : 'falling';
    }

    // Drift: currently in range, but the trend line crosses a bound within a year.
    let drift = null;
    if (status === 'normal' && points.length >= 3 && Math.abs(slopePerDay) > 0) {
      const target = slopePerDay > 0 ? high : low;
      if (typeof target === 'number') {
        const days = (target - latest.v) / slopePerDay;
        if (days > 0 && days <= DRIFT_DAYS) {
          drift = {
            toward: slopePerDay > 0 ? 'above range' : 'below range',
            days_to_cross: Math.round(days),
            bound: target,
          };
        }
      }
    }

    results.push({
      name: entry.name,
      unit: entry.unit,
      latest_value: latest.v,
      latest_date: latest.date,
      ref_low: low ?? null,
      ref_high: high ?? null,
      status,
      direction,
      percent_change: Number(pctChange.toFixed(1)),
      slope_per_day: Number(slopePerDay.toFixed(5)),
      span_days: Math.round(spanDays),
      position_in_range: positionInRange(latest.v, low, high),
      drift,
      unit_normalised: points.some((p) => p.normalised),
      readings: points.map((p) => ({ date: p.date, value: p.v })),
    });
  });

  // Most clinically interesting first: out of range, then drifting, then the rest.
  const rank = (r) => (r.status === 'above' || r.status === 'below' ? 0 : r.drift ? 1 : 2);
  return results.sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
};

module.exports = { analyseTrends, normalise, linearSlope, statusOf };
