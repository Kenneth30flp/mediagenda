export default function PageHeader({ title, subtitle }) {
  return (
    <header className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="label mb-2">MediAgenda Enterprise</p>
        <h2 className="text-3xl font-black tracking-tight text-ink md:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{subtitle}</p>}
      </div>
      <div className="rounded-2xl border border-[#28A745]/25 bg-[#28A745]/10 px-4 py-3 text-sm font-semibold text-[#28A745]">
        Operacion segura en tiempo real
      </div>
    </header>
  );
}
