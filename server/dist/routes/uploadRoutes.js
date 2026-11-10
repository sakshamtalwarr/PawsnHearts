"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uploadController_1 = require("../controllers/uploadController");
const uploadMiddleware_1 = require("../middleware/uploadMiddleware");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Public donation receipt screenshot upload
router.post('/receipt-proof', uploadMiddleware_1.upload.single('file'), uploadController_1.handleSingleUpload);
// Admin protected upload routes (supports up to 25 files at once)
router.post('/single', authMiddleware_1.requireAuth, uploadMiddleware_1.upload.single('file'), uploadController_1.handleSingleUpload);
router.post('/multiple', authMiddleware_1.requireAuth, uploadMiddleware_1.upload.array('files', 25), uploadController_1.handleMultipleUpload);
exports.default = router;
