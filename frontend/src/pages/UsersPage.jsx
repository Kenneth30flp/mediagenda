import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PageHeader from '../components/ui/PageHeader.jsx';
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
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyUser);
  const [error, setError] = useState('');

  if (currentUser?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  async function loadUsers() {
    setUsers(await api('/users'));
  }

  async function loadInitialData() {
    const [usersData, doctorsData] = await Promise.all([api('/users'), api('/doctors')]);
    setUsers(usersData);
    setDoctors(doctorsData);
  }

  useEffect(() => {
    loadInitialData().catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    try {
      await api('/users', { method: 'POST', body: JSON.stringify({ ...form, doctorId: form.role === 'doctor' ? Number(form.doctorId) : null }) });
      setForm(emptyUser);
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function changeAccess(user, changes) {
    setError('');
    const nextUser = { ...user, ...changes };
    try {
      await api(`/users/${user.id}/access`, {
        method: 'PATCH',
        body: JSON.stringify({
          role: nextUser.role,
          accessLevel: nextUser.accessLevel,
          doctorId: nextUser.role === 'doctor' ? Number(nextUser.doctorId) : null
        })
      });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(id) {
    if (!confirm('Deseas desactivar este empleado?')) return;
    setError('');

    try {
      await api(`/users/${id}`, { method: 'DELETE' });
      await loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <PageHeader title="Empleados y roles" subtitle="Administracion exclusiva para asignar permisos y perfiles del personal." />
      {error && <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form onSubmit={handleSubmit} className="card grid gap-3">
          <div className="mb-2">
            <p className="label">Nuevo empleado</p>
            <h3 className="mt-2 text-xl font-black">Crear acceso</h3>
          </div>
          <label className="text-sm font-medium text-slate-700">Nombre<input className="input mt-1" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Correo electronico<input className="input mt-1" required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Contrasena temporal<input className="input mt-1" required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Rol<select className="input mt-1" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value, doctorId: e.target.value === 'doctor' ? form.doctorId : '' })}>{roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">Permiso<select className="input mt-1" value={form.accessLevel} onChange={(e) => setForm({ ...form, accessLevel: e.target.value })}>{accessLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</select></label>
          {form.role === 'doctor' && <label className="text-sm font-medium text-slate-700">Doctor vinculado<select className="input mt-1" required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })}><option value="">Seleccionar doctor</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.firstName} {doctor.lastName} - {doctor.specialty}</option>)}</select></label>}
          <button className="btn-primary mt-2">Crear empleado</button>
        </form>

        <section className="card overflow-hidden">
          <div className="mb-5">
            <p className="label">Control de acceso</p>
            <h3 className="mt-1 text-xl font-black">Personal autorizado</h3>
          </div>
          <div className="grid gap-3">
            {users.map((user) => (
              <article key={user.id} className="rounded-3xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <p className="font-black text-[#1A2B4C]">{user.name}</p>
                    <p className="text-sm text-[#1A2B4C]/60">{user.email}</p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#28A745]">{user.accessLevel === 'editor' ? 'Editor' : 'Lector'}</p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <select className="input sm:w-44" value={user.role} onChange={(e) => changeAccess(user, { role: e.target.value, doctorId: e.target.value === 'doctor' ? user.doctorId : null })} disabled={String(user.id) === String(currentUser.id)}>
                      {roles.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                    </select>
                    <select className="input sm:w-36" value={user.accessLevel} onChange={(e) => changeAccess(user, { accessLevel: e.target.value })} disabled={String(user.id) === String(currentUser.id)}>
                      {accessLevels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
                    </select>
                    {user.role === 'doctor' && <select className="input sm:w-64" value={user.doctorId || ''} onChange={(e) => changeAccess(user, { doctorId: e.target.value })} disabled={String(user.id) === String(currentUser.id)}><option value="">Doctor vinculado</option>{doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.firstName} {doctor.lastName}</option>)}</select>}
                    <button className="btn-secondary text-red-600" onClick={() => remove(user.id)} disabled={String(user.id) === String(currentUser.id)}>Desactivar</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
