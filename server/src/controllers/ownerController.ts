import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { supabase } from '../config/supabase.js';

// @desc    Get all unique owners
// @route   GET /api/owners
// @access  Public
export const getOwners = asyncHandler(async (req: Request, res: Response) => {
    const { data, error } = await supabase
        .from('vehicles')
        .select('owner');

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    const ownerMap = new Map();
    data.forEach((v: any) => {
        if (v.owner && v.owner.name) {
            const key = `${v.owner.name.trim().toLowerCase()}-${v.owner.phone ? v.owner.phone.replace(/\D/g, '') : 'nophone'}`;
            if (!ownerMap.has(key)) {
                ownerMap.set(key, v.owner);
            }
        }
    });

    res.json(Array.from(ownerMap.values()));
});

// @desc    Update owner in all vehicles
// @route   PUT /api/owners
// @access  Private (Dashboard)
export const updateOwner = asyncHandler(async (req: Request, res: Response) => {
    const { oldName, oldPhone, newData } = req.body;

    if (!oldName) {
        res.status(400);
        throw new Error('Old name is required');
    }

    // Update all vehicles where owner matches oldName and oldPhone
    // Note: Supabase doesn't support deep nested JSON filtering easily in update 
    // without raw SQL or a specific RPC, but we can try to filter by the owner->>name syntax if supported
    // Actually, simpler is to fetch IDs and then update, or use the RPC if available.
    // For now, we'll use a direct update with JSON filter if allowed by the JS client.

    const { data, error } = await supabase
        .from('vehicles')
        .update({ owner_name: newData.name, owner_phone: newData.phone, owner_email: newData.email })
        .eq('owner_name', oldName)
        .eq('owner_phone', oldPhone);

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.json({ message: 'Owner updated successfully' });
});

// @desc    Delete owner and all their vehicles
// @route   DELETE /api/owners
// @access  Private (Dashboard)
export const deleteOwner = asyncHandler(async (req: Request, res: Response) => {
    const { name, phone } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Name is required');
    }

    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('owner_name', name)
        .eq('owner_phone', phone);

    if (error) {
        res.status(400);
        throw new Error(error.message);
    }

    res.json({ message: 'Owner and associated vehicles removed' });
});
