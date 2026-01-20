import express from 'express';
import {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
} from '../controllers/vehicleController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getVehicles)
    .post(protect, createVehicle);

router.route('/:id')
    .get(getVehicleById)
    .put(protect, updateVehicle)
    .delete(protect, deleteVehicle);

export default router;
