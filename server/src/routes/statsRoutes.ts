import { Router } from 'express';
import { getStats, getSettings, updateSettings } from '../controllers/statsController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getStats);
router.get('/settings', getSettings);
router.post('/settings', requireAuth, updateSettings);

export default router;
