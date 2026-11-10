import { Router } from 'express';
import { login, me, logout, changePassword, updateProfile } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.post('/login', login);
router.get('/me', requireAuth, me);
router.post('/logout', logout);
router.post('/change-password', requireAuth, changePassword);
router.put('/profile', requireAuth, updateProfile);
router.post('/update-profile', requireAuth, updateProfile);

export default router;
