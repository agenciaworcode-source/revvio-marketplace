import express from 'express';
import { getOwners, updateOwner, deleteOwner } from '../controllers/ownerController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getOwners);
router.put('/', protect, updateOwner);
router.delete('/', protect, deleteOwner);

export default router;
