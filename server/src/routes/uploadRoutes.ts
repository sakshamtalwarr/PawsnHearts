import { Router } from 'express';
import { handleSingleUpload, handleMultipleUpload } from '../controllers/uploadController';
import { upload } from '../middleware/uploadMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Admin protected upload routes
router.post('/single', requireAuth, upload.single('file'), handleSingleUpload);
router.post('/multiple', requireAuth, upload.array('files', 10), handleMultipleUpload);

export default router;
