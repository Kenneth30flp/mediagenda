import { useEffect, useState } from 'react';
import PageHeader from '../components/ui/PageHeader.jsx';
import Alert from '../components/ui/Alert.jsx';
import { api, getUser, setUser } from '../lib/api.js';

export default function ProfilePage() {
  const [profile, setProfile] = useState(getUser() || { name: '', email: '', role: '', accessLevel: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/profile/me')
      .then((data) => {
        setProfile(data);
        setUser(data);
      })
      .catch((err) => setError(err.message));
  }, []);

  async function updateProfile(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      const updated = await api('/profile/me', {
        method: 'PUT',
        body: JSON.stringify({ name: profile.name, email: profile.email })
      });
      setProfile(updated);
      setUser(updated);
      setMessage('Perfil actualizado correctamente.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function updatePassword(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    try {
      await api('/profile/me/password', { method: 'PATCH', body: JSON.stringify(passwordForm) });
      setPasswordForm({ currentPassword: '', newPassword: '' });
      setMessage('Contrasena actualizada correctamente.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <PageHeader title="Mi perfil" subtitle="Administra tu informacion personal y credenciales de acceso." />
      <Alert tone="success" message={message} onClose={() => setMessage('')} />
      <Alert tone="error" message={error} onClose={() => setError('')} />

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
        <form onSubmit={updateProfile} className="card grid gap-4">
          <div>
            <p className="label">Cuenta de usuario</p>
            <h3 className="mt-2 text-xl font-black">Datos personales</h3>
          </div>
          <label className="text-sm font-medium text-slate-700">Nombre<input className="input mt-1" required value={profile.name || ''} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Correo electronico<input className="input mt-1" required type="email" value={profile.email || ''} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4"><p className="label">Rol</p><p className="mt-1 font-black capitalize text-[#1A2B4C]">{profile.role}</p></div>
            <div className="rounded-2xl border border-[#B0B0B0]/25 bg-[#F7F9FB] p-4"><p className="label">Permiso</p><p className="mt-1 font-black capitalize text-[#1A2B4C]">{profile.accessLevel === 'reader' ? 'Lector' : 'Editor'}</p></div>
          </div>
          <button className="btn-primary mt-2">Guardar cambios</button>
        </form>

        <form onSubmit={updatePassword} className="card grid content-start gap-4">
          <div>
            <p className="label">Seguridad</p>
            <h3 className="mt-2 text-xl font-black">Cambiar contrasena</h3>
          </div>
          <label className="text-sm font-medium text-slate-700">Contrasena actual<input className="input mt-1" required type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} /></label>
          <label className="text-sm font-medium text-slate-700">Nueva contrasena<input className="input mt-1" required type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} /></label>
          <button className="btn-primary mt-2">Actualizar contrasena</button>
        </form>
      </div>
    </>
  );
}
