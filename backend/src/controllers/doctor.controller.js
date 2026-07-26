import * as Doctor from '../models/doctor.model.js';

export async function index(req, res, next) {
  try {
    res.json(await Doctor.listDoctors(req.query.specialty || ''));
  } catch (error) {
    next(error);
  }
}

export async function inactive(_req, res, next) {
  try {
    res.json(await Doctor.listInactiveDoctors());
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    res.status(201).json(await Doctor.createDoctor(req.body));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const doctor = await Doctor.updateDoctor(req.params.id, req.body);
    if (!doctor) return res.status(404).json({ message: 'Doctor no encontrado' });
    return res.json(doctor);
  } catch (error) {
    return next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const deleted = await Doctor.deactivateDoctor(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Doctor no encontrado' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

export async function restore(req, res, next) {
  try {
    const activated = await Doctor.activateDoctor(req.params.id);
    if (!activated) return res.status(404).json({ message: 'Doctor no encontrado' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
