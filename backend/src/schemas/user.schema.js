import { z } from 'zod';

export const roleSchema = z.enum(['admin', 'recepcion', 'doctor', 'asistente']);
export const accessLevelSchema = z.enum(['editor', 'reader']);

export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: roleSchema,
  accessLevel: accessLevelSchema,
  doctorId: z.number().int().positive().nullable().optional()
}).refine((data) => data.role !== 'doctor' || Boolean(data.doctorId), {
  message: 'El rol doctor debe estar vinculado a un doctor registrado',
  path: ['doctorId']
});

export const updateAccessSchema = z.object({
  role: roleSchema,
  accessLevel: accessLevelSchema,
  doctorId: z.number().int().positive().nullable().optional()
}).refine((data) => data.role !== 'doctor' || Boolean(data.doctorId), {
  message: 'El rol doctor debe estar vinculado a un doctor registrado',
  path: ['doctorId']
});

export const profileSchema = z.object({
  name: z.string().min(2),
  email: z.string().email()
});

export const passwordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6)
});
