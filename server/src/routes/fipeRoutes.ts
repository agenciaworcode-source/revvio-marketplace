import express from 'express';
import { getBrands, getModels, getYears, getPrice } from '../controllers/fipeController.js';

const router = express.Router();

router.get('/brands', getBrands);
router.get('/brands/:brandCode/models', getModels);
router.get('/brands/:brandCode/models/:modelCode/years', getYears);
router.get('/brands/:brandCode/models/:modelCode/years/:yearCode/price', getPrice);

export default router;
