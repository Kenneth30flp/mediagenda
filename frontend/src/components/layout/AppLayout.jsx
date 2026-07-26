import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../../lib/api.js';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '01', roles: ['admin', 'recepcion', 'doctor', 'asistente'] },
  { to: '/patients', label: 'Pacientes', icon: '02', roles: ['admin', 'recepcion'] },
  { to: '/doctors', label: 'Doctores', icon: '03', roles: ['admin', 'recepcion'] },
  { to: '/appointments', label: 'Citas', icon: '04', roles: ['admin', 'recepcion', 'doctor', 'asistente'] },
  { to: '/users', label: 'Empleados', icon: '05', roles: ['admin'] }
];

export default function AppLayout() {
  const navigate = useNavigate();
  const user = getUser();
  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  function logout() {
    clearSession();
    navigate('/', { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#F7F9FB] lg:flex">
      <aside className="relative overflow-hidden bg-[#1A2B4C] p-5 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-72">
        <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-[#28A745]/20 blur-3xl" />
        <div className="absolute -bottom-16 left-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mb-9 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#28A745] text-lg font-black shadow-glow">M</div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">Clinica</p>
            <h1 className="text-2xl font-black tracking-tight">MediAgenda</h1>
          </div>
        </div>
        <div className="relative mb-6 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Plan operativo</p>
          <p className="mt-2 text-sm font-semibold text-white">Gestion medica centralizada</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">Pacientes, doctores y citas en una sola vista segura.</p>
        </div>
        <nav className="relative grid gap-2">
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition ${isActive ? 'bg-white text-[#1A2B4C] shadow-glow' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
              }
            >
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-xs text-white group-hover:bg-[#28A745] group-hover:text-white">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="relative mt-8 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
          Cerrar sesion
        </button>
      </aside>
      <div className="flex-1 lg:ml-72">
        <header className="sticky top-0 z-10 border-b border-[#B0B0B0]/25 bg-white/85 px-4 py-4 backdrop-blur-xl md:px-8">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#28A745]">Centro medico corporativo</p>
              <p className="mt-1 text-sm text-[#1A2B4C]/65">Operaciones clinicas, agenda y administracion</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden rounded-full border border-[#28A745]/25 bg-[#28A745]/10 px-4 py-2 text-sm font-bold text-[#28A745] sm:block">Sistema en linea</div>
              <NavLink to="/profile" className="hidden rounded-2xl px-3 py-2 text-right text-xs text-[#1A2B4C]/60 transition hover:bg-[#F7F9FB] md:block"><strong className="block text-sm text-[#1A2B4C]">{user?.name || 'Usuario'}</strong>{user?.role || 'empleado'}</NavLink>
              <NavLink to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-[#1A2B4C] text-sm font-black text-white transition hover:bg-[#28A745]" title="Mi perfil">{user?.name?.slice(0, 2).toUpperCase() || 'US'}</NavLink>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
