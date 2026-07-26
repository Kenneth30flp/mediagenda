import { findUserByEmail } from '../models/user.model.js';
import { verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/token.js';

export async function login(req, res, next) {
  try {
    const user = await findUserByEmail(req.body.email);

    if (!user || !(await verifyPassword(req.body.password, user.password_hash))) {
      return res.status(401).json({ message: 'Credenciales invalidas' });
    }

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, accessLevel: user.accessLevel, doctorId: user.doctorId };
    return res.json({ user: safeUser, token: signToken(safeUser) });
  } catch (error) {
    return next(error);
  }
}
