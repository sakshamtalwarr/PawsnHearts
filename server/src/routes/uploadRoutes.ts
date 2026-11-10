import { Router } from 'express';
import { handleSingleUpload, handleMultipleUpload } from '../controllers/uploadController';
import { upload } from '../middleware/uploadMiddleware';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

// Public donation receipt screenshot upload
router.post('/receipt-proof', upload.single('file'), handleSingleUpload);

// Admin protected upload routes (supports up to 25 files at once)
router.post('/single', requireAuth, upload.single('file'), handleSingleUpload);
router.post('/multiple', requireAuth, upload.array('files', 25), handleMultipleUpload);

export default router;
