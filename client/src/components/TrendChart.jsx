import React from 'react';

/**
 * One marker over time. Single series, so no legend — the card title names it.
 * The reference range is a recessive band behind the line rather than two more
 * lines competing with the data.
 */
const TrendChart = ({ readings, refLow, refHigh, unit, status }) => {
  const W = 320;
  const H = 120;
  const PAD = { top: 12, right: 44, bottom: 22, left: 8 };

  if (!readings || readings.length === 0) return null;

  const values = readings.map((r) => r.value);
  const bounds = [
    ...values,
    ...(typeof refLow === 'number' ? [refLow] : []),
    ...(typeof refHigh === 'number' ? [refHigh] : []),
  ];
  let min = Math.min(...bounds);
  let max = Math.max(...bounds);
  const pad = (max - min) * 0.15 || Math.abs(max || 1) * 0.1;
  min -= pad;
  max += pad;

  const plotW = W - PAD.left - PAD.right;
  const plotH = H - PAD.top - PAD.bottom;

  const times = readings.map((r) => new Date(r.date).getTime());
  const tMin = Math.min(...times);
  const tMax = Math.max(...times);
  const x = (t) => PAD.left + (tMax === tMin ? plotW / 2 : ((t - tMin) / (tMax - tMin)) * plotW);
  const y = (v) => PAD.top + plotH - ((v - min) / (max - min)) * plotH;

  const points = readings.map((r, i) => ({ ...r, cx: x(times[i]), cy: y(r.value) }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.cx.toFixed(1)},${p.cy.toFixed(1)}`).join(' ');

  const bandTop = typeof refHigh === 'number' ? y(refHigh) : PAD.top;
  const bandBottom = typeof refLow === 'number' ? y(refLow) : PAD.top + plotH;

  const STATUS_COLOR = { above: '#F0524B', below: '#F0524B', normal: '#5EEAD4', unknown: '#94A3B8' };
  const lineColor = STATUS_COLOR[status] || '#5EEAD4';
  const last = points[points.length - 1];

  const fmt = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img"
         aria-label={`${readings.length} readings, latest ${last.value} ${unit || ''}`}>
      {(typeof refLow === 'number' || typeof refHigh === 'number') && (
        <rect
          x={PAD.left} y={Math.min(bandTop, bandBottom)}
          width={plotW} height={Math.max(2, Math.abs(bandBottom - bandTop))}
          fill="#34D399" opacity="0.08"
        />
      )}

      <line x1={PAD.left} y1={PAD.top + plotH} x2={PAD.left + plotW} y2={PAD.top + plotH}
            stroke="#1E293B" strokeWidth="1" />

      <path d={path} fill="none" stroke={lineColor} strokeWidth="2"
            strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.cx} cy={p.cy} r="4.5" fill={lineColor} stroke="#080E14" strokeWidth="2" />
          <circle cx={p.cx} cy={p.cy} r="10" fill="transparent">
            <title>{`${new Date(p.date).toLocaleDateString()}: ${p.value} ${unit || ''}`}</title>
          </circle>
        </g>
      ))}

      {/* Direct label on the latest point only — never a number on every point. */}
      <text x={last.cx + 9} y={last.cy + 4} fill="#E2E8F0" fontSize="12" fontWeight="600">
        {fmt(last.value)}
      </text>

      <text x={PAD.left} y={H - 6} fill="#64748B" fontSize="9">
        {new Date(tMin).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
      </text>
      {tMax !== tMin && (
        <text x={PAD.left + plotW} y={H - 6} fill="#64748B" fontSize="9" textAnchor="end">
          {new Date(tMax).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
        </text>
      )}
    </svg>
  );
};

export default TrendChart;
