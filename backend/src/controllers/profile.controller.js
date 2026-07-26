import * as User from '../models/user.model.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export async function show(req, res, next) {
  try {
    const user = await User.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

export async function update(req, res, next) {
  try {
    const user = await User.updateOwnProfile(req.user.id, req.body);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

export async function updatePassword(req, res, next) {
  try {
    const user = await User.findUserWithPasswordById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const validPassword = await verifyPassword(req.body.currentPassword, user.password_hash);
    if (!validPassword) return res.status(400).json({ message: 'La contrasena actual no es correcta' });

    await User.updateOwnPassword(req.user.id, await hashPassword(req.body.newPassword));
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
