<script lang="ts">
    import { onMount } from 'svelte';
    
    let synths = [];
    let overrides = {};
    let selectedIds = new Set();
    let searchQuery = '';
    let imageSearchQuery = '';
    let stats = '';

    onMount(() => {
        loadData();
    });

    async function loadData() {
        try {
            const resp = await fetch('/api/synths?includeInactive=true');
            const data = await resp.json();
            synths = data.items || data; // Handle both array and object responses
            const saved = localStorage.getItem('photoOverrides');
            if (saved) overrides = JSON.parse(saved);
            renderTable();
        } catch (e) {
            console.error('Error loading data:', e);
        }
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
        let filtered = synths.filter(s => {
            const str = `${s.modelName} ${s.brand} ${s.id}`.toLowerCase();
            return str.includes(search);
        });

        stats = `${synths.length} models | ${Object.keys(overrides).length} overrides`;
    }

    function editOverride(id) {
        const url = prompt('Enter image URL:', overrides[id] ? overrides[id][0] : '');
        if (url) {
            overrides[id] = [url];
            localStorage.setItem('photoOverrides', JSON.stringify(overrides));
            renderTable();
        }
    }

    function filterIssues() {
        // Filter logic would go here
        renderTable();
    }

    function showAll() { 
        searchQuery = '';
        renderTable(); 
    }

    function searchImages(query) {
        imageSearchQuery = query;
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
    <h1>🖼️ Photo Override Tool</h1>
    <div class="controls">
        <input type="text" bind:value={searchQuery} class="search" placeholder="Search models..." on:input={renderTable}>
        <button class="btn-secondary" on:click={filterIssues}>Show Issues</button>
        <button class="btn-secondary" on:click={showAll}>Show All</button>
        <button class="btn-primary" disabled={Object.keys(overrides).length === 0} on:click={exportOverrides}>Export</button>
    </div>
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
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {#each synths.slice(0, 200) as s}
                    <tr>
                        <td><img class="thumbnail" src={getImage(s) || ''} alt="" on:error={(e) => e.target.style.display='none'}></td>
                        <td>{s.modelName} {s.isGem ? '<span class="badge badge-gem">GEM</span>' : ''}</td>
                        <td>{s.brand}</td>
                        <td><code>{s.id}</code></td>
                        <td><span class="badge {getStatus(s).class}">{getStatus(s).label}</span></td>
                        <td><button class="btn-secondary edit-btn" on:click={() => editOverride(s.id)}>Edit</button></td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="sidebar">
        <h3>Quick Search</h3>
        <input type="text" bind:value={imageSearchQuery} class="input-small" placeholder="Search images...">
        <div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">
            {#each synths.filter(s => `${s.modelName} ${s.brand}`.toLowerCase().includes(imageSearchQuery.toLowerCase())).slice(0, 10) as s}
                <div style="padding: 5px; background: #0f3460; margin-bottom: 3px; border-radius: 3px; cursor: pointer;"
                     on:click={() => editOverride(s.id)}>
                    {s.brand} {s.modelName}
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
    .stats { color: #888; font-size: 13px; margin-top: 10px; }
</style>