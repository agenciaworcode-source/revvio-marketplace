import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { imageService } from '../services/imageService.js';

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const files = (req.files as Express.Multer.File[]) || [];

    if (files.length === 0) {
        res.status(400);
        throw new Error('Nenhum arquivo enviado');
    }

    // Filtra apenas arquivos que pertencem ao campo 'images' ou 'image'
    // Isso é mais flexível para evitar o erro "Unexpected field" do Multer
    const validFiles = files.filter(f => f.fieldname === 'images' || f.fieldname === 'image' || f.fieldname === 'images[]');

    if (validFiles.length === 0) {
        res.status(400);
        throw new Error('Campo de arquivo inesperado. Use "images".');
    }

    const uploadPromises = validFiles.map(file => imageService.processAndUpload(file));
    const urls = await Promise.all(uploadPromises);

    res.json(urls);
});
