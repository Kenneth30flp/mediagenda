import { Router } from 'express';
import { requireAuth, requireEditor, requireRoles } from '../middlewares/auth.js';
import { validate, validateId } from '../utils/validate.js';
import { patientSchema } from '../schemas/patient.schema.js';
import { destroy, index, store, update } from '../controllers/patient.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requireRoles('admin', 'recepcion'));
router.get('/', index);
router.post('/', requireEditor, validate(patientSchema), store);
router.put('/:id', validateId(), requireEditor, validate(patientSchema), update);
router.delete('/:id', validateId(), requireEditor, destroy);

export default router;
