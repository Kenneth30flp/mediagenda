import * as Patient from '../models/patient.model.js';

export async function index(req, res, next) {
  try {
    res.json(await Patient.listPatients(req.query.search || ''));
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    res.status(201).json(await Patient.createPatient(req.body));
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const patient = await Patient.updatePatient(req.params.id, req.body);
    if (!patient) return res.status(404).json({ message: 'Paciente no encontrado' });
    return res.json(patient);
  } catch (error) {
    return next(error);
  }
}

export async function destroy(req, res, next) {
  try {
    const deleted = await Patient.deactivatePatient(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Paciente no encontrado' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
