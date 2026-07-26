import { Router } from 'express';
import { requireAuth, requireEditor, requireRoles } from '../middlewares/auth.js';
import { validate } from '../utils/validate.js';
import { appointmentSchema, appointmentStatusSchema } from '../schemas/appointment.schema.js';
import { index, store, updateStatus } from '../controllers/appointment.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('admin', 'recepcion', 'doctor', 'asistente'));
router.get('/', index);
router.post('/', requireRoles('admin', 'recepcion'), requireEditor, validate(appointmentSchema), store);
router.patch('/:id/status', requireRoles('admin', 'doctor'), requireEditor, validate(appointmentStatusSchema), updateStatus);

export default router;
