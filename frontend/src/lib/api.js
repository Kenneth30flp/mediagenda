const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const rawUser = localStorage.getItem('user');

  try {
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    // Si el valor guardado quedo corrupto, no debe romper toda la aplicacion.
    localStorage.removeItem('user');
    return null;
  }
}

export function setSession({ token, user }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function setUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function isEditor(user) {
  return user?.role === 'admin' || user?.accessLevel === 'editor';
}

export async function api(path, options = {}) {
  const token = getToken();
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers
      }
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexion.');
  }

  // Sesion vencida o cuenta desactivada: hay que volver al login en lugar de
  // dejar al usuario en una pantalla que falla en cada peticion.
  if (response.status === 401 && path !== '/auth/login') {
    clearSession();
    window.location.assign('/login');
    throw new Error('Tu sesion expiro. Inicia sesion de nuevo.');
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Error ${response.status} al comunicarse con el servidor`);
  }

  return data;
}
