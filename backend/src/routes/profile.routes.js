import { Router } from 'express';
import { show, update, updatePassword } from '../controllers/profile.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { passwordSchema, profileSchema } from '../schemas/user.schema.js';
import { validate } from '../utils/validate.js';

const router = Router();

router.use(requireAuth);
router.get('/me', show);
router.put('/me', validate(profileSchema), update);
router.patch('/me/password', validate(passwordSchema), updatePassword);

export default router;
