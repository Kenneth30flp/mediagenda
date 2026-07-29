import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { useFeedback } from '../hooks/useFeedback.js';
import { api, getUser } from '../lib/api.js';

const roles = [
  { value: 'admin', label: 'Administrador' },
  { value: 'recepcion', label: 'Recepcion' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'asistente', label: 'Asistente' }
];

const accessLevels = [
  { value: 'editor', label: 'Editor' },
  { value: 'reader', label: 'Lector' }
];

const emptyUser = { name: '', email: '', password: '', role: 'recepcion', accessLevel: 'editor', doctorId: '' };

export default function UsersPage() {
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const { error, success, loading, clear, run } = useFeedback();

  useEffect(() => {
    // Los hooks deben ejecutarse siempre en el mismo orden, por eso la
    // redireccion de no-admin va despues de declararlos todos.
    if (!isAdmin) return;

    run(async () => {
      const [usersData, doctorsData] = await Promise.all([api('/users'), api('/doctors')]);
      setUsers(usersData);
      setDoctors(doctorsData);
    });
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  function buildDoctorId(role, doctorId) {
    if (role !== 'doctor') return null;
    return doctorId ? Number(doctorId) : null;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (form.role === 'doctor' && !form.doctorId) {
      return;
    }

    const created = await run(async () => {
      const user = await api('/users', {
        method: 'POST',
        body: JSON.stringify({ ...form, doctorId: buildDoctorId(form.role, form.doctorId) })
      });
      setUsers(await api('/users'));
      return user;
    }, 'Empleado creado correctamente.');

    if (created) setForm(emptyUser);
  }

  async function changeAccess(user, changes) {
    const nextUser = { ...user, ...changes };

    await run(async () => {
      await api(`/users/${user.id}/access`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: nextUser.role,
          accessLevel: nextUser.accessLevel,
          doctorId: buildDoctorId(nextUser.role, nextUser.doctorId)
        })
      });
      setUsers(await api('/users'));
    }, 'Permisos actualizados correctamente.');
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este empleado?')) return;

    await run(async () => {
      await api(`/users/${id}`, { method: 'DELETE' });
      setUsers(await api('/users'));
    }, 'Empleado desactivado correctamente.');
  }

  return (
    <>
      <PageHeader title="Empleados y roles" subtitle="Administracion exclusiva para asignar permisos y perfiles del personal." />
      <Alert tone="error" message={error} onClose={clear} />
      <Alert tone="success" message={success} onClose={clear} />

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="card grid gap-3">
          <div className="mb-2">
            <p className="label">Nuevo empleado</p>
            <h3 className="mt-2 text-xl font-black">Crear acceso</h3>
          </div>
          <label className="text-sm font-medium text-slate-700">Nombre<input className="input mt-1" required minLength={2} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Correo electronico<input className="input mt-1" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Contrasena temporal<input className="input mt-1" required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><span className="mt-1 block text-xs font-normal text-slate-500">Minimo 6 caracteres.</span></label>
          <label className="text-sm font-medium text-slate-700">Rol<select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, doctorId: e.target.value === 'doctor' ? form.doctorId : '' })}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Permiso<select className="input mt-1" value={form.accessLevel} onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}>{accessLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</select></label>
          {form.role === 'doctor' && (
            <label className="text-sm font-medium text-slate-700">
              Doctor vinculado
              <select className="input mt-1" required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}>
                <option value="">Seleccionar doctor</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.firstName} {doctor.lastName} - {doctor.specialty}</option>)}
              </select>
            </label>
          )}
          <button className="btn-primary mt-2" disabled={loading}>{loading ? 'Guardando...' : 'Crear empleado'}</button>
        </form>

        <section className="card overflow-hidden">
          <div className="mb-5">
            <p className="label">Control de acceso</p>
            <h3 className="mt-1 text-xl font-black">Personal autorizado</h3>
          </div>
          <div className="grid gap-3">
            {users.map((user) => {
              const isSelf = String(user.id) === String(currentUser.id);

              return (
                <article key={user.id} className="rounded-3xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4">
                  <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div>
                      <p className="font-black text-[#1A2B4C]">{user.name}{isSelf && <span className="ml-2 rounded-full bg-[#1A2B4C] px-2 py-0.5 text-[10px] uppercase tracking-wider text-white">Tu cuenta</span>}</p>
                      <p className="text-sm text-[#1A2B4C]/60">{user.email}</p>
                      <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#28A745]">{user.accessLevel === 'editor' ? 'Editor' : 'Lector'}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <select className="input sm:w-44" value={user.role} onChange={(e) => changeAccess(user, { role: e.target.value })} disabled={isSelf || loading}>
                        {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>
                      <select className="input sm:w-36" value={user.accessLevel} onChange={(e) => changeAccess(user, { accessLevel: e.target.value })} disabled={isSelf || loading}>
                        {accessLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                      </select>
                      {user.role === 'doctor' && (
                        <select className="input sm:w-64" value={user.doctorId || ''} onChange={(e) => changeAccess(user, { doctorId: e.target.value })} disabled={isSelf || loading}>
                          <option value="">Doctor vinculado</option>
                          {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.firstName} {doctor.lastName}</option>)}
                        </select>
                      )}
                      <button className="btn-secondary text-red-600" onClick={() => remove(user.id)} disabled={isSelf || loading}>Desactivar</button>
                    </div>
                  </div>
                </article>
              );
            })}
            {users.length === 0 && (
              <div className="rounded-3xl border border-dashed border-[#B0B0B0]/40 p-8 text-center text-sm font-semibold text-[#1A2B4C]/60">
                {loading ? 'Cargando empleados...' : 'No hay empleados registrados.'}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
