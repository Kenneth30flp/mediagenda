import * as Appointment from '../models/appointment.model.js';

export async function index(req, res, next) {
  try {
    res.json(await Appointment.listAppointments(req.user));
  } catch (error) {
    next(error);
  }
}

export async function store(req, res, next) {
  try {
    res.status(201).json(await Appointment.createAppointment(req.body));
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const appointment = await Appointment.updateAppointmentStatus(req.params.id, req.body.status, req.user);
    if (!appointment) return res.status(404).json({ message: 'Cita no encontrada' });
    return res.json(appointment);
  } catch (error) {
    return next(error);
  }
}
