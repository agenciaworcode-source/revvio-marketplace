import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

const WEBHOOK_URL = 'https://n8n.agenciaworcode.com.br/webhook/revvio-saas';

// @desc    Submit lead to external webhook
// @route   POST /api/leads
// @access  Public
export const submitLead = asyncHandler(async (req: Request, res: Response) => {
    const leadData = req.body;

    if (!leadData.name || !leadData.phone) {
        res.status(400);
        throw new Error('Name and phone are required');
    }

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(leadData),
        });

        if (!response.ok) {
            throw new Error(`External webhook failed with status ${response.status}`);
        }

        res.json({ success: true, message: 'Lead sent successfully' });
    } catch (error) {
        res.status(502); // Bad Gateway
        throw new Error(`Failed to send lead to external service: ${(error as Error).message}`);
    }
});
