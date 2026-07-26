import { z } from 'zod';

export const doctorSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  specialty: z.string().min(2),
  medicalLicense: z.string().min(3),
  email: z.string().email(),
  availability: z.string().min(3)
});
