import Sparkline from '../charts/Sparkline.jsx';

export default function StatTile({ label, value, detail, delta, sparkline, tone = 'bg-[#1A2B4C]' }) {
  return (
    <article className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft">
      <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] ${tone} opacity-90`} />
      <p className="relative text-sm font-bold text-slate-500">{label}</p>
      <strong className="relative mt-4 block text-5xl font-black tracking-tight text-ink">{value}</strong>

      <div className="relative mt-3 flex min-h-[28px] items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{detail}</p>
        {sparkline && <Sparkline data={sparkline} />}
      </div>

      {delta && (
        <div className={`relative mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
          delta.direction === 'up' ? 'bg-[#28A745]/10 text-[#28A745]' : delta.direction === 'down' ? 'bg-[#1A2B4C]/8 text-[#1A2B4C]/70' : 'bg-slate-100 text-slate-500'
        }`}>
          <span>{delta.direction === 'up' ? '▲' : delta.direction === 'down' ? '▼' : '—'}</span>
          <span>{delta.text}</span>
        </div>
      )}
    </article>
  );
}
