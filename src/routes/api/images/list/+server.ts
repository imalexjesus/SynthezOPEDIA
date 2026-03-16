import { json } from '@sveltejs/kit';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function GET() {
    const cacheDir = path.join(process.cwd(), 'static', 'images', 'cache');
    
    try {
        await fs.access(cacheDir);
        const files = await fs.readdir(cacheDir);
        return json({ files });
    } catch (e) {
        return json({ files: [] });
    }
}
