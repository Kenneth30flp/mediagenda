import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, accessLevel: user.accessLevel, doctorId: user.doctorId },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}
