import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { api } from '../lib/api.js';

const cards = [
  { key: 'totalPatients', label: 'Total de pacientes', detail: 'Registros activos', tone: 'bg-[#1A2B4C]' },
  { key: 'activeDoctors', label: 'Doctores activos', detail: 'Especialistas disponibles', tone: 'bg-[#28A745]' },
  { key: 'todayAppointments', label: 'Citas de hoy', detail: 'Agenda del dia', tone: 'bg-[#B0B0B0]' }
];

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({ totalPatients: 0, activeDoctors: 0, todayAppointments: 0 });
  const [error, setError] = useState('');

  useEffect(() => {
    api('/dashboard/metrics')
      .then(setMetrics)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <>
      <PageHeader title="Panel ejecutivo" subtitle="Resumen operativo de la clinica con indicadores clave para toma de decisiones." />
      <Alert tone="error" message={error} onClose={() => setError('')} />
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => (
          <article key={card.key} className="relative overflow-hidden rounded-3xl bg-white p-6 shadow-soft">
            <div className={`absolute right-0 top-0 h-24 w-24 rounded-bl-[3rem] ${card.tone} opacity-90`} />
            <p className="text-sm font-bold text-slate-500">{card.label}</p>
            <strong className="mt-4 block text-5xl font-black tracking-tight text-ink">{metrics[card.key]}</strong>
            <p className="mt-2 text-sm text-slate-500">{card.detail}</p>
          </article>
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="card">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="label">Operacion diaria</p>
              <h3 className="mt-2 text-2xl font-black">Flujo de atencion controlado</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Usa el menu lateral para registrar pacientes, administrar doctores y mantener la agenda medica actualizada.</p>
            </div>
            <div className="rounded-2xl bg-[#1A2B4C] px-5 py-4 text-white">
              <p className="text-xs uppercase tracking-[0.2em] text-white/60">Estado</p>
              <p className="mt-1 text-lg font-black">Clinica operativa</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {['Datos validados', 'Rutas protegidas', 'Agenda centralizada'].map((item) => <div key={item} className="rounded-2xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4 text-sm font-bold text-[#1A2B4C]">{item}</div>)}
          </div>
        </article>
        <article className="card bg-[#1A2B4C] text-white">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">Recomendacion</p>
          <h3 className="mt-4 text-2xl font-black">Mantener agenda sin conflictos</h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">El sistema evita duplicar citas para un mismo doctor en la misma fecha y hora.</p>
        </article>
      </section>
    </>
  );
}
