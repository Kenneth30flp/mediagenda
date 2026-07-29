import { useMemo, useState } from 'react';

const WIDTH = 560;
const HEIGHT = 168;
const AXIS_BAND = 28;
const PADDING_TOP = 22;

function roundedTopBarPath(x, yTop, width, yBottom, radius) {
  const height = yBottom - yTop;
  if (height <= 0.5) return '';
  const r = Math.min(radius, width / 2, height);

  return `
    M ${x} ${yBottom}
    L ${x} ${yTop + r}
    Q ${x} ${yTop} ${x + r} ${yTop}
    L ${x + width - r} ${yTop}
    Q ${x + width} ${yTop} ${x + width} ${yTop + r}
    L ${x + width} ${yBottom}
    Z
  `;
}

// Grafica de barras de una sola serie (citas por dia). Sigue el gráfico de la
// skill dataviz: un solo hue, gridlines hairline, etiqueta directa selectiva
// (solo el maximo) y una capa de hover accesible por mouse y teclado.
export default function TrendBarChart({ data, title = 'Citas por dia' }) {
  const [hovered, setHovered] = useState(null);

  const chartHeight = HEIGHT - AXIS_BAND - PADDING_TOP;
  const baseline = PADDING_TOP + chartHeight;
  const maxValue = Math.max(...data.map((d) => d.count), 1);
  const scaleMax = Math.max(Math.ceil(maxValue * 1.25), 4);
  const bandWidth = WIDTH / data.length;
  const barWidth = Math.min(28, bandWidth * 0.42);

  const bars = useMemo(() => data.map((day, index) => {
    const x = index * bandWidth + (bandWidth - barWidth) / 2;
    const barHeight = (day.count / scaleMax) * chartHeight;
    const yTop = baseline - barHeight;
    return { ...day, index, x, yTop, path: roundedTopBarPath(x, yTop, barWidth, baseline, 4) };
  }), [data, bandWidth, barWidth, chartHeight, baseline, scaleMax]);

  const maxBarIndex = bars.reduce((best, bar) => (bar.count > bars[best].count ? bar.index : best), 0);
  const gridSteps = [0, 0.5, 1].map((fraction) => ({
    y: baseline - fraction * chartHeight,
    label: Math.round(scaleMax * fraction)
  }));

  const hoveredBar = hovered !== null ? bars[hovered] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label={title} preserveAspectRatio="xMidYMid meet">
        {gridSteps.map((step) => (
          <g key={step.label}>
            <line x1="0" x2={WIDTH} y1={step.y} y2={step.y} stroke="#E6E9EF" strokeWidth="1" />
            <text x="0" y={step.y - 4} fontSize="10" fill="#94A3B8" fontWeight="600">{step.label}</text>
          </g>
        ))}

        {bars.map((bar) => (
          <g key={bar.label + bar.index}>
            <path
              d={bar.path}
              fill="#28A745"
              opacity={bar.isToday || hovered === bar.index ? 1 : 0.55}
              style={{ transition: 'opacity 200ms ease' }}
            />
            {bar.index === maxBarIndex && bar.count > 0 && (
              <text x={bar.x + barWidth / 2} y={bar.yTop - 8} textAnchor="middle" fontSize="12" fontWeight="800" fill="#1A2B4C">
                {bar.count}
              </text>
            )}
            <text
              x={bar.index * bandWidth + bandWidth / 2}
              y={HEIGHT - 8}
              textAnchor="middle"
              fontSize="11"
              fontWeight={bar.isToday ? 800 : 600}
              fill={bar.isToday ? '#28A745' : '#94A3B8'}
            >
              {bar.label}
            </text>
            <rect
              x={bar.index * bandWidth}
              y={PADDING_TOP - 8}
              width={bandWidth}
              height={chartHeight + 8}
              fill="transparent"
              tabIndex={0}
              role="img"
              aria-label={`${bar.label}: ${bar.count} citas`}
              onMouseEnter={() => setHovered(bar.index)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(bar.index)}
              onBlur={() => setHovered(null)}
            />
          </g>
        ))}
      </svg>

      {hoveredBar && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl bg-[#1A2B4C] px-3 py-2 text-xs font-bold text-white shadow-lg"
          style={{ left: `${((hoveredBar.index + 0.5) / data.length) * 100}%`, top: `${(hoveredBar.yTop / HEIGHT) * 100 - 4}%` }}
        >
          <div className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
            {hoveredBar.date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' })}
          </div>
          <div className="text-sm">{hoveredBar.count} {hoveredBar.count === 1 ? 'cita' : 'citas'}</div>
        </div>
      )}
    </div>
  );
}
