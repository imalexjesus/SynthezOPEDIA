import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';
import axios from 'axios';

export async function GET({ url }: { url: URL }) {
    const imageUrl = url.searchParams.get('url');
    
    if (!imageUrl) {
        return json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        // Generate a unique filename based on the URL
        const urlHash = Buffer.from(imageUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
        const fileExt = path.extname(new URL(imageUrl).pathname) || '.jpg';
        
        // Path where files are stored (not in static folder, as it's not copied to Docker)
        const cacheDir = path.join(process.cwd(), 'data', 'cache', 'images');
        const cachePath = path.join(cacheDir, `${urlHash}${fileExt}`);
        
        // Create cache directory if it doesn't exist
        try {
            await fs.mkdir(cacheDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        // Check if file already exists in cache
        try {
            await fs.access(cachePath);
            console.log(`✅ Serving from cache: ${urlHash}${fileExt}`);
            
            // Return the cached file URL (served via API endpoint)
            return json({
                cached: true,
                url: `/api/images/cache/${urlHash}${fileExt}`
            });
        } catch (e) {
            // File doesn't exist in cache, download it
        }

        // Download the image
        console.log(`⬇️ Downloading: ${imageUrl}`);
        const response = await axios({
            url: imageUrl,
            method: 'GET',
            responseType: 'arraybuffer',
            timeout: 30000
        });

        // Save to cache
        try {
            await fs.writeFile(cachePath, response.data);
            console.log(`✅ Saved to cache: ${urlHash}${fileExt}`);
        } catch (e) {
            console.log('Could not save to cache:', e);
        }

        // Return the cached file URL
        return json({
            cached: false,
            url: `/api/images/cache/${urlHash}${fileExt}`
        });

    } catch (error: unknown) {
        console.error('Error caching image:', error);
        // Return original URL on error
        return json({
            cached: false,
            url: imageUrl
        });
    }
}
