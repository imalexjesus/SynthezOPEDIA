<script lang="ts">
    import { onMount } from 'svelte';
    
    let synths = [];
    let overrides = {};
    let selectedIds = new Set();
    let searchQuery = '';
    let imageSearchQuery = '';
    let stats = '';
    let cachedImages = new Set();
    let loadingCache = $state(false);

    onMount(() => {
        loadData();
        checkCachedImages();
    });

    async function loadData() {
        try {
            const resp = await fetch('/api/synths?includeInactive=true');
            const data = await resp.json();
            synths = data.items || data;
            const saved = localStorage.getItem('photoOverrides');
            if (saved) overrides = JSON.parse(saved);
            renderTable();
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    async function checkCachedImages() {
        loadingCache = true;
        try {
            const resp = await fetch('/api/images/list');
            const data = await resp.json();
            cachedImages = new Set(data.files || []);
        } catch (e) {
            cachedImages = new Set();
        }
        loadingCache = false;
    }

    function isImageCached(synth): boolean {
        if (!synth.images || !synth.images[0]) return false;
        const hash = md5(synth.images[0]);
        return cachedImages.has(hash + '.jpg') || cachedImages.has(hash + '.png') || cachedImages.has(hash + '.jpeg');
    }

    function md5(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    function getImage(s) {
        return overrides[s.id] ? overrides[s.id][0] : (s.images && s.images[0]) || '';
    }

    function getStatus(s) {
        const img = getImage(s);
        if (overrides[s.id]) return { label: 'Override', class: 'badge-gem' };
        if (!img) return { label: 'No Image', class: 'badge-error' };
        if (img.includes('ytimg')) return { label: 'Bad Image', class: 'badge-warning' };
        return { label: 'OK', class: '' };
    }

    function renderTable() {
        const search = searchQuery.toLowerCase();
        stats = `${synths.length} models | ${Object.keys(overrides).length} overrides | ${cachedImages.size} cached`;
    }

    function editOverride(id) {
        const url = prompt('Enter image URL:', overrides[id] ? overrides[id][0] : '');
        if (url) {
            overrides[id] = [url];
            localStorage.setItem('photoOverrides', JSON.stringify(overrides));
            renderTable();
        }
    }

    async function toggleCache(synth) {
        if (!synth.images || !synth.images[0]) {
            alert('No image URL in this synth');
            return;
        }
        
        const isCached = isImageCached(synth);
        
        if (isCached) {
            if (confirm('Clear cached image? It will be re-downloaded from the URL next time.')) {
                // API to clear would need to be implemented
                alert('Cache clear not implemented yet - would delete from /app/static/images/cache/');
            }
        } else {
            // Cache from DB URL
            try {
                const resp = await fetch(`/api/cache-image?url=${encodeURIComponent(synth.images[0])}&force=true`);
                const data = await resp.json();
                if (data.url || data.cached) {
                    alert('Image cached successfully!');
                    checkCachedImages();
                } else {
                    alert('Failed to cache image');
                }
            } catch (e) {
                alert('Error caching image: ' + e);
            }
        }
    }

    async function syncToDb(id) {
        try {
            const synth = synths.find(s => s.id === id);
            if (!synth) return;
            
            const resp = await fetch(`/api/synths/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(synth)
            });
            
            if (resp.ok) {
                alert('Saved to NocoDB!');
            } else {
                alert('Error saving to DB');
            }
        } catch (e) {
            alert('Error: ' + e);
        }
    }

    async function syncFromDb(id) {
        alert('Data is always loaded from DB on page load. To update fallback file, use the main editor.');
    }

    async function syncAllToDb() {
        if (!confirm(`Sync all ${synths.length} synths to NocoDB?`)) return;
        
        let success = 0, failed = 0;
        for (const synth of synths) {
            try {
                const resp = await fetch(`/api/synths/${synth.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(synth)
                });
                if (resp.ok) success++; else failed++;
            } catch (e) {
                failed++;
            }
        }
        alert(`Synced to DB: ${success} success, ${failed} failed`);
    }

    async function cacheAllImages() {
        if (!confirm(`Cache images for all ${synths.length} synths?`)) return;
        
        let success = 0, failed = 0;
        for (const synth of synths) {
            if (synth.images && synth.images[0]) {
                try {
                    const resp = await fetch(`/api/cache-image?url=${encodeURIComponent(synth.images[0])}&force=true`);
                    if (resp.ok) success++; else failed++;
                } catch (e) {
                    failed++;
                }
                await new Promise(r => setTimeout(r, 200)); // Rate limit
            }
        }
        alert(`Cached: ${success} success, ${failed} failed`);
        checkCachedImages();
    }

    function filterIssues() {
        renderTable();
    }

    function showAll() { 
        searchQuery = '';
        renderTable(); 
    }

    function exportOverrides() {
        const content = 'export const photoOverrides: Record<string, string[]> = {\n' +
            Object.entries(overrides).map(([id, urls]) => `  "${id}": [${urls.map(u => `'${u}'`).join(', ')}]`).join(',\n') +
            '\n};';
        const blob = new Blob([content], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'photo-overrides.ts';
        a.click();
    }
</script>

<div class="header">
    <h1>🖼️ Photo Tool & Sync</h1>
    <div class="controls">
        <input type="text" bind:value={searchQuery} class="search" placeholder="Search models..." oninput={renderTable}>
        <button class="btn-secondary" onclick={filterIssues}>Show Issues</button>
        <button class="btn-secondary" onclick={showAll}>Show All</button>
        <button class="btn-primary" disabled={Object.keys(overrides).length === 0} onclick={exportOverrides}>Export</button>
    </div>
</div>

<div class="sync-controls">
    <button class="btn-sync" onclick={cacheAllImages}>📥 Cache All Images</button>
    <button class="btn-sync" onclick={syncAllToDb}>💾 Sync All to DB</button>
    <button class="btn-secondary" onclick={checkCachedImages}>🔄 Refresh Cache Status</button>
    {#if loadingCache}<span class="loading">Loading...</span>{/if}
</div>

<div class="main-grid">
    <div>
        <table id="modelsTable">
            <thead>
                <tr>
                    <th>Photo</th>
                    <th>Model</th>
                    <th>Brand</th>
                    <th>ID</th>
                    <th>Status</th>
                    <th>Cache</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each synths.slice(0, 200) as s}
                    <tr>
                        <td><img class="thumbnail" src={getImage(s) || ''} alt="" onerror={(e) => e.target.style.display='none'}></td>
                        <td>{s.modelName} {s.isGem ? '<span class="badge badge-gem">GEM</span>' : ''}</td>
                        <td>{s.brand}</td>
                        <td><code>{s.id}</code></td>
                        <td><span class="badge {getStatus(s).class}">{getStatus(s).label}</span></td>
                        <td>
                            <button 
                                class="btn-cache {isImageCached(s) ? 'cached' : ''}" 
                                onclick={() => toggleCache(s)}
                                title={isImageCached(s) ? 'Click to clear cache' : 'Click to cache image'}
                            >
                                {isImageCached(s) ? '✅ Cached' : '⬜ Not cached'}
                            </button>
                        </td>
                        <td>
                            <button class="btn-secondary edit-btn" onclick={() => editOverride(s.id)}>Edit img URL</button>
                            <a href="/synths/{s.brand.toLowerCase()}/{encodeURIComponent(s.series)}/{encodeURIComponent(s.modelName)}" class="btn-link" target="_blank">Edit card</a>
                            <button class="btn-small" onclick={() => syncToDb(s.id)} title="Save current data to NocoDB">→DB</button>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="sidebar">
        <h3>Quick Search</h3>
        <input type="text" bind:value={imageSearchQuery} class="input-small" placeholder="Search model...">
        <div style="max-height: 300px; overflow-y: auto; margin-top: 10px;">
            {#each synths.filter(s => `${s.modelName} ${s.brand}`.toLowerCase().includes(imageSearchQuery.toLowerCase())).slice(0, 20) as s}
                <div style="padding: 8px; background: #0f3460; margin-bottom: 3px; border-radius: 3px; cursor: pointer; display: flex; justify-content: space-between; align-items: center;"
                     onclick={() => window.open(`/synths/${s.brand.toLowerCase()}/${encodeURIComponent(s.series)}/${encodeURIComponent(s.modelName)}`, '_blank')}>
                    <span>{s.brand} {s.modelName}</span>
                    <span style="color: #00d9ff; font-size: 12px;">→</span>
                </div>
            {/each}
        </div>
    </div>
</div>

<div class="stats">{stats}</div>

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    h1 { color: #00d9ff; margin: 0; }
    .controls { display: flex; gap: 10px; flex-wrap: wrap; }
    .sync-controls { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
    .btn-sync { background: #27ae60; color: #fff; }
    .btn-sync:hover { background: #2ecc71; }
    .loading { color: #f39c12; }
    button {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
    }
    .btn-primary { background: #00d9ff; color: #000; }
    .btn-primary:hover { background: #00b8d9; }
    .btn-secondary { background: #444; color: #fff; }
    .btn-secondary:hover { background: #555; }
    .search { padding: 10px; border-radius: 6px; border: 1px solid #333; background: #16213e; color: #fff; width: 350px; }
    .main-grid { display: grid; grid-template-columns: 1fr 350px; gap: 20px; }
    table { width: 100%; border-collapse: collapse; background: #16213e; border-radius: 8px; overflow: hidden; }
    th, td { padding: 10px; text-align: left; border-bottom: 1px solid #333; }
    th { background: #0f3460; font-weight: 600; }
    tr:hover { background: #1a1a3e; }
    .thumbnail { width: 50px; height: 35px; object-fit: cover; border-radius: 3px; }
    .input-small { width: 100%; padding: 6px; border: 1px solid #333; background: #0f3460; color: #fff; border-radius: 4px; }
    .badge { padding: 2px 6px; border-radius: 3px; font-size: 11px; }
    .badge-gem { background: #f39c12; color: #000; }
    .badge-error { background: #e74c3c; color: #fff; }
    .badge-warning { background: #f39c12; color: #000; }
    .edit-btn { margin-right: 5px; padding: 6px 12px; font-size: 12px; }
    .btn-small { padding: 4px 8px; font-size: 10px; background: #8e44ad; color: #fff; margin-left: 5px; }
    .btn-link { 
        display: inline-block;
        padding: 6px 12px; 
        background: #0f3460; 
        color: #00d9ff; 
        text-decoration: none; 
        border-radius: 6px;
        font-size: 12px;
        font-weight: 600;
    }
    .btn-link:hover { background: #00d9ff; color: #000; }
    .btn-cache { padding: 4px 8px; font-size: 10px; background: #333; color: #888; }
    .btn-cache.cached { background: #27ae60; color: #fff; }
    .btn-cache:hover { opacity: 0.8; }
    .stats { color: #888; font-size: 13px; margin-top: 10px; }
</style>
