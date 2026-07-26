import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  documentId: z.string().min(4),
  phone: z.string().min(7),
  email: z.string().email(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
