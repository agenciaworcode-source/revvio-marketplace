import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../config/supabase.js';
import { mapToVehicle, mapToRow } from '../config/mapper.js';

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Public
export const getVehicles = asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    res.json((data || []).map(mapToVehicle));
});

// @desc    Get single vehicle
// @route   GET /api/vehicles/:id
// @access  Public
export const getVehicleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        res.status(404);
        throw new Error('Vehicle not found');
    }

    res.json(mapToVehicle(data));
});

// @desc    Create new vehicle
// @route   POST /api/vehicles
// @access  Private (Dashboard)
export const createVehicle = asyncHandler(async (req: Request, res: Response) => {
    const row = mapToRow(req.body);

    const { data, error } = await supabase
        .from('vehicles')
        .insert([row])
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.status(201).json(mapToVehicle(data));
});

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Dashboard)
export const updateVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const row = mapToRow(req.body);

    const { data, error } = await supabase
        .from('vehicles')
        .update(row)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.json(mapToVehicle(data));
});

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Dashboard)
export const deleteVehicle = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id);

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.json({ message: 'Vehicle removed' });
});
