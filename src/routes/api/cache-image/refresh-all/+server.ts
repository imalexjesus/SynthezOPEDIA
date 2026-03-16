import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { synths } from '$lib/data/synths';

async function downloadImage(imageUrl: string): Promise<Buffer | null> {
    return new Promise((resolve) => {
        try {
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
                    resolve(null);
                    return;
                }
                
                const chunks: Buffer[] = [];
                res.on('data', (chunk) => chunks.push(chunk));
                res.on('end', () => resolve(Buffer.concat(chunks)));
            });
            
            req.on('error', () => resolve(null));
            req.setTimeout(30000, () => {
                req.destroy();
                resolve(null);
            });
            req.end();
        } catch {
            resolve(null);
        }
    });
}

export async function POST() {
    const results: { success: number; failed: number; total: number } = {
        success: 0,
        failed: 0,
        total: 0
    };

    // Get all unique image URLs from synths
    const allUrls = new Set<string>();
    for (const synth of synths) {
        if (synth.images && synth.images.length > 0) {
            for (const img of synth.images) {
                allUrls.add(img);
            }
        }
    }

    results.total = allUrls.size;
    const cacheDir = path.join(process.cwd(), 'static', 'images', 'cache');

    // Ensure cache directory exists
    try {
        await fs.mkdir(cacheDir, { recursive: true });
    } catch (e) {
        // Directory might already exist
    }

    console.log(`🔄 Starting refresh of ${results.total} images...`);

    let processed = 0;
    for (const imageUrl of allUrls) {
        processed++;
        
        try {
            const urlHash = Buffer.from(imageUrl).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 50);
            const fileExt = path.extname(new URL(imageUrl).pathname) || '.jpg';
            const cachePath = path.join(cacheDir, `${urlHash}${fileExt}`);

            // Delete existing file
            try {
                await fs.unlink(cachePath);
            } catch (e) {
                // File doesn't exist
            }

            // Download fresh
            console.log(`⬇️ [${processed}/${results.total}] Downloading: ${imageUrl}`);
            const imageData = await downloadImage(imageUrl);

            if (imageData) {
                await fs.writeFile(cachePath, imageData);
                results.success++;
                console.log(`✅ Saved: ${urlHash}${fileExt}`);
            } else {
                results.failed++;
                console.log(`❌ Failed: ${imageUrl}`);
            }

            // Small delay to avoid rate limiting
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            results.failed++;
            console.error(`❌ Error processing ${imageUrl}:`, error);
        }
    }

    console.log(`🎉 Refresh complete! Success: ${results.success}, Failed: ${results.failed}`);

    return json(results);
}
