import { Router } from 'express';
import { requireAdmin, requireAuth, requireEditor, requireRoles } from '../middlewares/auth.js';
import { validate } from '../utils/validate.js';
import { doctorSchema } from '../schemas/doctor.schema.js';
import { destroy, inactive, index, restore, store, update } from '../controllers/doctor.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('admin', 'recepcion'));
router.get('/', index);
router.get('/inactive', requireAdmin, inactive);
router.post('/', requireEditor, validate(doctorSchema), store);
router.put('/:id', requireEditor, validate(doctorSchema), update);
router.patch('/:id/activate', requireAdmin, restore);
router.delete('/:id', requireAdmin, requireEditor, destroy);

export default router;
