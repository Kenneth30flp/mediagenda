import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { findUserById } from '../models/user.model.js';

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  let payload;

  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
  }

  try {
    // El token vive 8 horas: sin esta consulta, un empleado desactivado o al que
    // se le bajaron los permisos seguiria operando con los datos viejos del token.
    const user = await findUserById(payload.id);

    if (!user) {
      return res.status(401).json({ message: 'Tu cuenta ya no esta activa. Inicia sesion de nuevo.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      accessLevel: user.accessLevel,
      doctorId: user.doctorId
    };
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso exclusivo para administradores' });
  }

  return next();
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta accion' });
    }

    return next();
  };
}

export function requireEditor(req, res, next) {
  if (req.user?.role === 'admin' || req.user?.accessLevel === 'editor') {
    return next();
  }

  return res.status(403).json({ message: 'Tu permiso es de lector. No puedes crear, editar ni eliminar registros' });
}
