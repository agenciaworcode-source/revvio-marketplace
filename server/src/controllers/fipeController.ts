import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { fipeService } from '../services/fipeService.js';

// @desc    Get all car brands from FIPE
// @route   GET /api/fipe/brands
// @access  Public
export const getBrands = asyncHandler(async (req: Request, res: Response) => {
    const brands = await fipeService.getBrands();
    res.json(brands);
});

// @desc    Get models by brand
// @route   GET /api/fipe/brands/:brandCode/models
// @access  Public
export const getModels = asyncHandler(async (req: Request, res: Response) => {
    const brandCode = req.params.brandCode as string;
    const models = await fipeService.getModels(brandCode);
    res.json(models);
});

// @desc    Get years by brand and model
// @route   GET /api/fipe/brands/:brandCode/models/:modelCode/years
// @access  Public
export const getYears = asyncHandler(async (req: Request, res: Response) => {
    const brandCode = req.params.brandCode as string;
    const modelCode = req.params.modelCode as string;
    const years = await fipeService.getYears(brandCode, modelCode);
    res.json(years);
});

// @desc    Get FIPE price
// @route   GET /api/fipe/brands/:brandCode/models/:modelCode/years/:yearCode/price
// @access  Public
export const getPrice = asyncHandler(async (req: Request, res: Response) => {
    const brandCode = req.params.brandCode as string;
    const modelCode = req.params.modelCode as string;
    const yearCode = req.params.yearCode as string;
    const priceData = await fipeService.getPrice(brandCode, modelCode, yearCode);
    res.json(priceData);
});
