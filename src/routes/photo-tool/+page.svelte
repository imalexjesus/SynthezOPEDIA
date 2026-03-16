<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Override Tool - SynthezOPEDIA</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
            color: #e0e0e0;
            min-height: 100vh;
            padding: 20px;
        }
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
</head>
<body>
    <div class="header">
        <h1>🖼️ Photo Override Tool</h1>
        <div class="controls">
            <input type="text" id="search" class="search" placeholder="Search models...">
            <button class="btn-secondary" id="filterBtn">Show Issues</button>
            <button class="btn-secondary" id="showAllBtn">Show All</button>
            <button class="btn-primary" id="exportBtn" disabled>Export</button>
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
                <tbody id="tableBody">
                </tbody>
            </table>
        </div>
        <div class="sidebar">
            <h3>Quick Search</h3>
            <input type="text" id="imageSearch" class="input-small" placeholder="Search images...">
            <div id="imageResults" style="max-height: 200px; overflow-y: auto; margin-top: 10px;"></div>
        </div>
    </div>

    <div class="stats" id="stats"></div>

    <script>
        let synths = [];
        let overrides = {};
        let selectedIds = new Set();

        async function loadData() {
            try {
                const resp = await fetch('/api/synths');
                synths = await resp.json();
                const saved = localStorage.getItem('photoOverrides');
                if (saved) overrides = JSON.parse(saved);
                renderTable();
            } catch (e) {
                document.getElementById('tableBody').innerHTML = '<tr><td colspan="6">Error loading data</td></tr>';
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
            const search = document.getElementById('search').value.toLowerCase();
            let filtered = synths.filter(s => {
                const str = `${s.modelName} ${s.brand} ${s.id}`.toLowerCase();
                return str.includes(search);
            });

            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = filtered.slice(0, 200).map(s => {
                const img = getImage(s);
                const status = getStatus(s);
                return `
                    <tr>
                        <td><img class="thumbnail" src="${img || ''}" onerror="this.style.display='none'"></td>
                        <td>${s.modelName} ${s.isGem ? '<span class="badge badge-gem">GEM</span>' : ''}</td>
                        <td>${s.brand}</td>
                        <td><code>${s.id}</code></td>
                        <td><span class="badge ${status.class}">${status.label}</span></td>
                        <td><button class="btn-secondary edit-btn" data-id="${s.id}">Edit</button></td>
                    </tr>
                `;
            }).join('');

            document.getElementById('stats').textContent = `${synths.length} models | ${Object.keys(overrides).length} overrides`;
            document.getElementById('exportBtn').disabled = Object.keys(overrides).length === 0;

            // Attach event listeners to edit buttons
            document.querySelectorAll('.edit-btn').forEach(btn => {
                btn.addEventListener('click', () => editOverride(btn.dataset.id));
            });
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
            const filtered = synths.filter(s => {
                const img = getImage(s);
                return !img || img.includes('ytimg');
            });
            const tbody = document.getElementById('tableBody');
            tbody.innerHTML = filtered.map(s => {
                const img = getImage(s);
                return `
                    <tr>
                        <td><img class="thumbnail" src="${img || ''}" onerror="this.style.display='none'"></td>
                        <td>${s.modelName}</td>
                        <td>${s.brand}</td>
                        <td><code>${s.id}</code></td>
                        <td>Issue</td>
                        <td><button class="btn-secondary" onclick="editOverride('${s.id}')">Fix</button></td>
                    </tr>
                `;
            }).join('');
        }

        function showAll() { renderTable(); }

        function searchImages(query) {
            if (query.length < 2) {
                document.getElementById('imageResults').innerHTML = '';
                return;
            }
            const results = synths.filter(s => 
                `${s.modelName} ${s.brand}`.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10);
            document.getElementById('imageResults').innerHTML = results.map(s => `
                <div style="padding: 5px; background: #0f3460; margin-bottom: 3px; border-radius: 3px; cursor: pointer;"
                     onclick="editOverride('${s.id}')">
                    ${s.brand} ${s.modelName}
                </div>
            `).join('');
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

        // Event listeners
        document.getElementById('search').addEventListener('input', renderTable);
        document.getElementById('filterBtn').addEventListener('click', filterIssues);
        document.getElementById('showAllBtn').addEventListener('click', showAll);
        document.getElementById('exportBtn').addEventListener('click', exportOverrides);
        document.getElementById('imageSearch').addEventListener('keyup', (e) => searchImages(e.target.value));

        loadData();
    </script>
</body>
</html>