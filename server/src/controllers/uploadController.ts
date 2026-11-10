import { Request, Response } from 'express';
import { StorageService } from '../services/storageService';

export const handleSingleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'media';
    const result = await StorageService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    res.json({
      message: 'File uploaded successfully',
      file: result,
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ error: err.message || 'File upload failed' });
  }
};

export const handleMultipleUpload = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const folder = (req.body.folder as string) || 'media';
    const uploadPromises = files.map((file) =>
      StorageService.uploadFile(file.buffer, file.originalname, file.mimetype, folder)
    );

    const results = await Promise.all(uploadPromises);

    res.json({
      message: `${results.length} files uploaded successfully`,
      files: results,
    });
  } catch (err: any) {
    console.error('Multiple file upload error:', err);
    res.status(500).json({ error: err.message || 'Multiple file upload failed' });
  }
};
