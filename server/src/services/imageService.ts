import sharp from 'sharp';
import { supabase } from '../config/supabase.js';
import { v4 as uuidv4 } from 'uuid';

export const imageService = {
    async processAndUpload(file: Express.Multer.File): Promise<string> {
        // Generate unique filename
        const fileName = `${uuidv4()}.webp`;
        const filePath = `vehicles/${fileName}`;

        // Process image with Sharp
        const optimizedBuffer = await sharp(file.buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
            .from('vehicles')
            .upload(filePath, optimizedBuffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image to Supabase:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }

        // Get public URL
        const { data } = supabase.storage
            .from('vehicles')
            .getPublicUrl(filePath);

        return data.publicUrl;
    },

    async processAndUploadThumbnail(file: Express.Multer.File): Promise<string> {
        const fileName = `thumb_${uuidv4()}.webp`;
        const filePath = `vehicles/${fileName}`;

        const thumbnailBuffer = await sharp(file.buffer)
            .resize(400, 400, {
                fit: 'cover'
            })
            .webp({ quality: 70 })
            .toBuffer();

        const { error: uploadError } = await supabase.storage
            .from('vehicles')
            .upload(filePath, thumbnailBuffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading thumbnail to Supabase:', uploadError);
            throw new Error(`Failed to upload thumbnail: ${uploadError.message}`);
        }

        const { data } = supabase.storage
            .from('vehicles')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }
};
