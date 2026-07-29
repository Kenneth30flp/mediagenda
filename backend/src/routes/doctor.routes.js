import { Router } from 'express';
import { requireAdmin, requireAuth, requireEditor, requireRoles } from '../middlewares/auth.js';
import { validate, validateId } from '../utils/validate.js';
import { doctorSchema } from '../schemas/doctor.schema.js';
import { destroy, inactive, index, restore, store, update } from '../controllers/doctor.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('admin', 'recepcion'));
router.get('/', index);
router.get('/inactive', requireAdmin, inactive);
router.post('/', requireEditor, validate(doctorSchema), store);
router.put('/:id', validateId(), requireEditor, validate(doctorSchema), update);
router.patch('/:id/activate', validateId(), requireAdmin, restore);
router.delete('/:id', validateId(), requireAdmin, requireEditor, destroy);

export default router;
