import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { imageService } from '../services/imageService.js';

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        res.status(400);
        throw new Error('No files uploaded');
    }

    const uploadPromises = files.map(file => imageService.processAndUpload(file));
    const urls = await Promise.all(uploadPromises);

    res.json(urls);
});
