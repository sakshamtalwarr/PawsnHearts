import { Router } from 'express';
import { login, me, logout, changePassword } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);
router.post('/change-password', requireAuth, changePassword);

export default router;
