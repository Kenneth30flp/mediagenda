import { Router } from 'express';
import { requireAdmin, requireAuth } from '../middlewares/auth.js';
import { destroy, index, store, updateAccess } from '../controllers/user.controller.js';
import { updateAccessSchema, userSchema } from '../schemas/user.schema.js';
import { validate } from '../utils/validate.js';

const router = Router();

router.use(requireAuth, requireAdmin);
router.get('/', index);
router.post('/', validate(userSchema), store);
router.patch('/:id/access', validate(updateAccessSchema), updateAccess);
router.delete('/:id', destroy);

export default router;
