import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, setSession } from '../lib/api.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@clinica.com', password: 'Admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const session = await api('/auth/login', { method: 'POST', body: JSON.stringify(form) });
      setSession(session);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen overflow-hidden bg-[#1A2B4C] p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
      <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-[#28A745]/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <section className="relative hidden min-h-[calc(100vh-4rem)] flex-col justify-between rounded-[2rem] border border-white/10 bg-white/5 p-10 text-white backdrop-blur lg:flex">
        <div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#28A745] text-xl font-black shadow-glow">M</div>
          <p className="mt-8 text-sm font-bold uppercase tracking-[0.32em] text-white/60">MediAgenda Enterprise</p>
          <h1 className="mt-5 max-w-2xl text-6xl font-black leading-none tracking-tight">Plataforma clinica para operaciones de alto nivel.</h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300">Agenda medica, gestion de pacientes y control operativo en una experiencia moderna, segura y lista para escalar.</p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['JWT seguro', 'PostgreSQL', 'Dashboard live'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/10 p-4 text-sm font-semibold">{item}</div>)}
        </div>
      </section>
      <div className="relative grid place-items-center">
        <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/95 p-8 shadow-2xl backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#28A745]">Acceso corporativo</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">Iniciar sesion</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">Accede al panel central de gestion de citas medicas.</p>

        {error && <div className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

        <div className="mt-6 grid gap-4">
          <label className="text-sm font-medium text-slate-700">
            Correo electronico
            <input className="input mt-1" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Contrasena
            <input className="input mt-1" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <button className="btn-primary w-full" disabled={loading}>{loading ? 'Validando...' : 'Entrar al sistema'}</button>
        </div>
        <p className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">Usuario demo: admin@clinica.com / Admin123</p>
      </form>
      </div>
    </div>
  );
}
