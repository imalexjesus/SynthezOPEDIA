import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

export async function GET({ url }: { url: URL }) {
    const imageUrl = url.searchParams.get('url');
    const force = url.searchParams.get('force') === 'true';
    
    if (!imageUrl) {
        return json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        // Generate a unique filename based on the URL
        const urlHash = Buffer.from(imageUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
        const fileExt = path.extname(new URL(imageUrl).pathname) || '.jpg';
        
        // Path where files are stored (in static folder, accessible via API)
        const cacheDir = path.join(process.cwd(), 'static', 'images', 'cache');
        const cachePath = path.join(cacheDir, `${urlHash}${fileExt}`);
        
        // Create cache directory if it doesn't exist
        try {
            await fs.mkdir(cacheDir, { recursive: true });
        } catch (e) {
            // Directory might already exist
        }

        // Check if file already exists in cache (skip if force=true)
        if (!force) {
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
        } else {
            // Force refresh: delete existing file
            try {
                await fs.unlink(cachePath);
                console.log(`🗑️ Deleted cached file for refresh: ${urlHash}${fileExt}`);
            } catch (e) {
                // File doesn't exist, that's fine
            }
        }

        // Download the image using native https module
        console.log(`⬇️ Downloading: ${imageUrl}`);
        
        const downloadPromise = new Promise<Buffer>((resolve, reject) => {
            const urlObj = new URL(imageUrl);
            const protocol = urlObj.protocol === 'https:' ? https : http;
            
            const options = {
                hostname: urlObj.hostname,
                port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Connection': 'keep-alive'
                }
            };
            
            const req = protocol.request(options, (res) => {
                if (res.statusCode !== 200) {
                    reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                    return;
                }
                
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            });
            
            req.on('error', reject);
            req.setTimeout(30000, () => {
                req.destroy();
                reject(new Error('Timeout'));
            });
            req.end();
        });
        
        const imageData = await downloadPromise;

        // Save to cache
        try {
            await fs.writeFile(cachePath, imageData);
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
