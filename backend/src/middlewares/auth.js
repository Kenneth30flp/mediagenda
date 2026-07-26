import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token invalido o expirado' });
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
