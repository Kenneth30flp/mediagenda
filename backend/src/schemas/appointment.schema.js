import { z } from 'zod';

export const appointmentStatuses = ['pending', 'completed', 'cancelled'];

export const appointmentSchema = z.object({
  patientId: z.number({ invalid_type_error: 'Selecciona un paciente' }).int().positive(),
  doctorId: z.number({ invalid_type_error: 'Selecciona un doctor' }).int().positive(),
  appointmentAt: z.string().datetime({ message: 'La fecha y hora de la cita no es valida' }),
  status: z.enum(appointmentStatuses).optional()
}).refine((data) => new Date(data.appointmentAt).getTime() > Date.now() - 60_000, {
  message: 'No se puede agendar una cita en una fecha pasada',
  path: ['appointmentAt']
});

export const appointmentStatusSchema = z.object({
  status: z.enum(appointmentStatuses)
});
