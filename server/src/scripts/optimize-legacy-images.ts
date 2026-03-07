import { supabase } from '../config/supabase.js';
import sharp from 'sharp';
import fetch from 'node-fetch';

async function optimizeLegacyImages() {
    console.log('--- Starting Legacy Image Optimization ---');

    // 1. Fetch all vehicles
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, images');

    if (error) {
        console.error('Error fetching vehicles:', error);
        return;
    }

    console.log(`Found ${vehicles?.length} vehicles to process.`);

    for (const vehicle of vehicles || []) {
        if (!vehicle.images || vehicle.images.length === 0) continue;

        console.log(`Processing vehicle ID: ${vehicle.id}`);
        const newImageUrls: string[] = [];
        let updated = false;

        for (const imageUrl of vehicle.images) {
            // Check if already optimized (e.g., ends in .webp)
            if (imageUrl.endsWith('.webp')) {
                newImageUrls.push(imageUrl);
                continue;
            }

            try {
                console.log(`  Optimizing image: ${imageUrl}`);
                
                // 2. Download current image
                const response = await fetch(imageUrl);
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                // 3. Process with Sharp
                const optimizedBuffer = await sharp(buffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                // 4. Upload to Supabase Storage
                const fileName = `legacy_${Date.now()}_${Math.random().toString(36).substring(7)}.webp`;
                const filePath = `vehicles/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('vehicles')
                    .upload(filePath, optimizedBuffer, {
                        contentType: 'image/webp',
                        cacheControl: '3600'
                    });

                if (uploadError) throw uploadError;

                // 5. Get new URL
                const { data } = supabase.storage
                    .from('vehicles')
                    .getPublicUrl(filePath);

                newImageUrls.push(data.publicUrl);
                updated = true;
            } catch (err) {
                console.error(`  Error processing image ${imageUrl}:`, err);
                newImageUrls.push(imageUrl); // Keep original if error
            }
        }

        if (updated) {
            // 6. Update database
            const { error: updateError } = await supabase
                .from('vehicles')
                .update({ images: newImageUrls })
                .eq('id', vehicle.id);

            if (updateError) {
                console.error(`  Error updating vehicle ${vehicle.id}:`, updateError);
            } else {
                console.log(`  Vehicle ${vehicle.id} updated successfully.`);
            }
        }
    }

    console.log('--- Legacy Image Optimization Completed ---');
}

optimizeLegacyImages().catch(err => console.error('Migration failed:', err));
