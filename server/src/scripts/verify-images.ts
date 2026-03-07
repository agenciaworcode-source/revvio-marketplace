import { supabase } from '../config/supabase.js';
import fetch from 'node-fetch';

async function verifyOptimization() {
    console.log('--- Verification Started ---');

    // 1. Check DB for WebP URLs
    const { data: vehicles, error } = await supabase
        .from('vehicles')
        .select('id, images')
        .limit(10);

    if (error) {
        console.error('Error fetching vehicles:', error);
        return;
    }

    const webpVehicles = vehicles?.filter(v => v.images?.some((img: string) => img.endsWith('.webp')));
    console.log(`Vehicles with WebP images: ${webpVehicles?.length} out of ${vehicles?.length} sampled.`);

    if (webpVehicles && webpVehicles.length > 0) {
        const testImage = webpVehicles[0].images.find((img: string) => img.endsWith('.webp'));
        console.log(`Testing image: ${testImage}`);

        try {
            const response = await fetch(testImage!);
            const contentType = response.headers.get('content-type');
            const size = response.headers.get('content-length');
            
            console.log(`Content-Type: ${contentType}`);
            console.log(`Size: ${size ? (parseInt(size) / 1024).toFixed(2) + ' KB' : 'Unknown'}`);
            
            if (contentType === 'image/webp') {
                console.log('✅ PASS: Image is serving as WebP');
            } else {
                console.log('❌ FAIL: Image is NOT serving as WebP');
            }
        } catch (err) {
            console.error('Error fetching test image:', err);
        }
    } else {
        console.log('❌ FAIL: No WebP images found in the sample.');
    }

    console.log('--- Verification Finished ---');
}

verifyOptimization().catch(err => console.error('Verification failed:', err));
