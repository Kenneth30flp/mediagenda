import { Router } from 'express';
import { login } from '../controllers/auth.controller.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { validate } from '../utils/validate.js';

const router = Router();

router.post('/login', validate(loginSchema), login);

export default router;
