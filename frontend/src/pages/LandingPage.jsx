import { Link } from 'react-router-dom';

const services = [
  'Medicina general',
  'Cardiologia preventiva',
  'Pediatria integral',
  'Agenda medica digital'
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1A2B4C]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1A2B4C] text-lg font-black text-white">M</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#28A745]">Clinica</p>
            <p className="text-xl font-black tracking-tight">MediAgenda</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-semibold text-[#1A2B4C]/75 md:flex">
          <a href="#servicios" className="hover:text-[#28A745]">Servicios</a>
          <a href="#contacto" className="hover:text-[#28A745]">Contacto</a>
          <Link to="/login" className="rounded-full bg-[#1A2B4C] px-5 py-2.5 text-white transition hover:bg-[#28A745]">Ingresar</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-[#B0B0B0]/40 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-[#28A745]">Salud privada moderna</p>
            <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-[#1A2B4C] md:text-7xl">
              Atencion medica serena, precisa y profesional.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#1A2B4C]/70">
              Plataforma clinica minimalista para gestionar pacientes, doctores y citas con una experiencia visual clara, confiable y sofisticada.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="rounded-full bg-[#28A745] px-7 py-3.5 text-center text-sm font-black text-white shadow-lg shadow-green-700/20 transition hover:bg-[#21883a]">Entrar al sistema</Link>
              <a href="#contacto" className="rounded-full border border-[#B0B0B0]/60 px-7 py-3.5 text-center text-sm font-black text-[#1A2B4C] transition hover:border-[#28A745] hover:text-[#28A745]">Contactar clinica</a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full bg-[#28A745]/10 blur-2xl" />
            <div className="rounded-[2rem] border border-[#B0B0B0]/35 bg-white p-6 shadow-[0_35px_90px_-55px_rgba(26,43,76,0.65)]">
              <div className="rounded-[1.5rem] bg-[#1A2B4C] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B0B0B0]">Panel clinico</p>
                <div className="mt-8 grid gap-4">
                  {[['Pacientes activos', '2'], ['Doctores disponibles', '2'], ['Agenda del dia', '0']].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                      <span className="text-sm text-white/75">{label}</span>
                      <strong className="text-3xl font-black text-[#28A745]">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="servicios" className="border-y border-[#B0B0B0]/25 bg-[#F7F9FB] px-6 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#28A745]">Servicios</p>
            <div className="mt-4 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <h2 className="text-4xl font-black tracking-tight text-[#1A2B4C]">Cuidado medico con estructura corporativa.</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <article key={service} className="rounded-3xl border border-[#B0B0B0]/25 bg-white p-6">
                    <div className="mb-5 h-2 w-12 rounded-full bg-[#28A745]" />
                    <h3 className="text-lg font-black text-[#1A2B4C]">{service}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#1A2B4C]/65">Gestion clara, seguimiento oportuno y experiencia centrada en el paciente.</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="contacto" className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#28A745]">Contacto</p>
            <h2 className="mt-4 text-4xl font-black tracking-tight text-[#1A2B4C]">Agenda una evaluacion o administra tu clinica.</h2>
          </div>
          <div className="rounded-[2rem] border border-[#B0B0B0]/35 p-6">
            <p className="text-sm font-bold text-[#1A2B4C]">MediAgenda Medical Center</p>
            <p className="mt-3 text-sm leading-7 text-[#1A2B4C]/70">Av. Salud Corporativa 1200<br />contacto@mediagenda.com<br />+1 555 0100</p>
            <Link to="/login" className="mt-6 inline-flex rounded-full bg-[#1A2B4C] px-6 py-3 text-sm font-black text-white transition hover:bg-[#28A745]">Acceder al portal</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
