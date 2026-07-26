import * as User from '../models/user.model.js';
import { hashPassword } from '../utils/password.js';

export async function index(_req, res, next) {
  try {
    res.json(await User.listUsers());
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    const passwordHash = await hashPassword(req.body.password);
    const user = await User.createUser({ ...req.body, passwordHash });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
}

export async function updateAccess(req, res, next) {
  try {
    const user = await User.updateUserAccess(req.params.id, req.body);
    if (!user) return res.status(404).json({ message: 'Empleado no encontrado' });
    return res.json(user);
  } catch (error) {
    return next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    if (String(req.user.id) === String(req.params.id)) {
      return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta' });
    }

    const deleted = await User.deactivateUser(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Empleado no encontrado' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
