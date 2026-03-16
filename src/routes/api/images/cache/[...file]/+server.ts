import { error } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET({ params }: { params: { file: string } }) {
    const filePath = params.file; // Это уже строка пути
    
    try {
        // Build the path to the cached image
        // Images are saved in /app/data/cache/images/
        const cacheDir = path.join(process.cwd(), 'data', 'cache', 'images');
        const imagePath = path.join(cacheDir, filePath);
        
        // Check if file exists
        await fs.access(imagePath);
        
        // Read the file
        const imageData = await fs.readFile(imagePath);
        
        // Determine content type based on file extension
        const ext = path.extname(filePath).toLowerCase();
        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        if (ext === '.gif') contentType = 'image/gif';
        if (ext === '.webp') contentType = 'image/webp';
        
        // Return the image (Buffer is acceptable to Response in Node.js)
        // @ts-ignore - Buffer is compatible with Response body in Node.js
        return new Response(imageData, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
            }
        });
        
    } catch (e) {
        // File not found or other error
        console.error('Error serving cached image:', e);
        throw error(404, 'Image not found');
    }
}
