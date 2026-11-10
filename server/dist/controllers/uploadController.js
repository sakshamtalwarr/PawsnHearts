"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipleUpload = exports.handleSingleUpload = void 0;
const storageService_1 = require("../services/storageService");
const handleSingleUpload = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        const folder = req.body.folder || 'media';
        const result = await storageService_1.StorageService.uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, folder);
        res.json({
            message: 'File uploaded successfully',
            file: result,
        });
    }
    catch (err) {
        console.error('File upload error:', err);
        res.status(500).json({ error: err.message || 'File upload failed' });
    }
};
exports.handleSingleUpload = handleSingleUpload;
const handleMultipleUpload = async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'No files uploaded' });
            return;
        }
        const folder = req.body.folder || 'media';
        const uploadPromises = files.map((file) => storageService_1.StorageService.uploadFile(file.buffer, file.originalname, file.mimetype, folder));
        const results = await Promise.all(uploadPromises);
        res.json({
            message: `${results.length} files uploaded successfully`,
            files: results,
        });
    }
    catch (err) {
        console.error('Multiple file upload error:', err);
        res.status(500).json({ error: err.message || 'Multiple file upload failed' });
    }
};
exports.handleMultipleUpload = handleMultipleUpload;
