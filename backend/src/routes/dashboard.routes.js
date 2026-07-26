import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { metrics } from '../controllers/dashboard.controller.js';

const router = Router();

router.use(requireAuth);
router.get('/metrics', metrics);

export default router;
