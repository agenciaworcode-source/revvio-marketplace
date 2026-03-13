import express from 'express';
import multer from 'multer';
import { uploadImages } from '../controllers/uploadController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer to store files in memory
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

router.post('/', protect, upload.any(), uploadImages);

export default router;
