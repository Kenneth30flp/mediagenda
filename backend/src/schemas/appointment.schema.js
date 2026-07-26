import { z } from 'zod';

export const appointmentSchema = z.object({
  patientId: z.number().int().positive(),
  doctorId: z.number().int().positive(),
  appointmentAt: z.string().datetime(),
  status: z.enum(['pending', 'completed', 'cancelled']).optional()
});

export const appointmentStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'cancelled'])
});
