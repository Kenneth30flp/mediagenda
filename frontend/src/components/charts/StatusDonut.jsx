import { useState } from 'react';
import { CheckIcon, ClockIcon, XIcon } from '../icons/Icons.jsx';

const STATUS_META = {
  pending: { label: 'Pendientes', color: '#F59E0B', Icon: ClockIcon },
  completed: { label: 'Completadas', color: '#28A745', Icon: CheckIcon },
  cancelled: { label: 'Canceladas', color: '#EF4444', Icon: XIcon }
};

const SIZE = 168;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 6;

// Donut de estado (pendiente/completada/cancelada). Cada estado siempre lleva
// icono + etiqueta + numero visible, nunca solo color, y cada valor esta
// disponible sin necesidad de pasar el mouse.
export default function StatusDonut({ breakdown }) {
  const [hovered, setHovered] = useState(null);
  const { total } = breakdown;

  let offset = 0;
  const segments = Object.entries(STATUS_META).map(([key, meta]) => {
    const value = breakdown[key] || 0;
    const fraction = total > 0 ? value / total : 0;
    const length = Math.max(fraction * CIRCUMFERENCE - GAP, 0);
    const segment = { key, meta, value, fraction, dashArray: `${length} ${CIRCUMFERENCE - length}`, dashOffset: -offset };
    offset += fraction * CIRCUMFERENCE;
    return segment;
  });

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Distribucion de citas por estado">
          <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#F1F3F6" strokeWidth={STROKE} />
          {segments.map((segment) => (
            <circle
              key={segment.key}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={segment.meta.color}
              strokeWidth={hovered === segment.key ? STROKE + 4 : STROKE}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              style={{ transition: 'stroke-width 150ms ease' }}
              tabIndex={0}
              role="img"
              aria-label={`${segment.meta.label}: ${segment.value} de ${total}`}
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(segment.key)}
              onBlur={() => setHovered(null)}
            >
              <title>{`${segment.meta.label}: ${segment.value}`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="text-center">
            <strong className="block text-4xl font-black tracking-tight text-ink">{total}</strong>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">citas</span>
          </div>
        </div>
      </div>

      <div className="grid w-full gap-2 sm:w-auto">
        {segments.map((segment) => {
          const { Icon } = segment.meta;
          const percentage = total > 0 ? Math.round(segment.fraction * 100) : 0;

          return (
            <button
              type="button"
              key={segment.key}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-left transition ${hovered === segment.key ? 'border-[#B0B0B0]/50 bg-[#F7F9FB]' : 'border-transparent'}`}
              onMouseEnter={() => setHovered(segment.key)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(segment.key)}
              onBlur={() => setHovered(null)}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: `${segment.meta.color}1f`, color: segment.meta.color }}>
                <Icon className="h-4 w-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-bold text-[#1A2B4C]">{segment.meta.label}</span>
                <span className="block text-xs text-[#1A2B4C]/50">{percentage}% del total</span>
              </span>
              <span className="text-lg font-black text-[#1A2B4C]">{segment.value}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
