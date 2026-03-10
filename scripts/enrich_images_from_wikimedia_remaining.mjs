import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');
const entries = [...source.matchAll(/  \{[\s\S]*?\n  \},/g)].map((m) => m[0]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeModel(model) {
  return model.replace(/\s+/g, ' ').trim();
}

async function searchFiles(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('srnamespace', '6');
  url.searchParams.set('srlimit', '8');
  url.searchParams.set('srsearch', query);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SynthezOPEDIA/1.0 (remaining enrichment)' }
  });
  if (!res.ok) return [];

  const json = await res.json();
  return (json?.query?.search ?? []).map((r) => r.title).filter(Boolean);
}

async function imageUrlForTitle(title) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url');
  url.searchParams.set('format', 'json');
  url.searchParams.set('titles', title);

  const res = await fetch(url, {
    headers: { 'User-Agent': 'SynthezOPEDIA/1.0 (remaining enrichment)' }
  });
  if (!res.ok) return null;

  const json = await res.json();
  const pages = json?.query?.pages;
  if (!pages) return null;
  const first = Object.values(pages)[0];
  const img = first?.imageinfo?.[0]?.url;
  return typeof img === 'string' ? img : null;
}

function bestTitle(titles, model) {
  if (!titles.length) return null;
  const lower = model.toLowerCase();
  const exact = titles.find((t) => t.toLowerCase().includes(lower));
  if (exact) return exact;
  return titles[0];
}

let updated = source;
let checked = 0;
let replaced = 0;

for (const entry of entries) {
  if (!entry.includes('example.com')) continue;

  const brandMatch = entry.match(/brand: '([^']+)'/);
  const modelMatch = entry.match(/modelName: '([^']+)'/);
  if (!brandMatch || !modelMatch) continue;

  const brand = brandMatch[1];
  const model = normalizeModel(modelMatch[1]);
  checked += 1;

  const queries = [
    `intitle:${model} ${brand}`,
    `${brand} ${model}`,
    `${model} ${brand}`,
    `${brand} keyboard ${model}`,
    `${brand} synthesizer ${model}`,
    `${brand} Casiotone ${model}`,
    `${brand} PortaSound ${model}`,
    `${brand} SK ${model}`
  ];

  let imageUrl = null;
  for (const query of queries) {
    const titles = await searchFiles(query);
    const title = bestTitle(titles, model);
    if (!title) {
      await sleep(120);
      continue;
    }

    imageUrl = await imageUrlForTitle(title);
    await sleep(120);
    if (imageUrl) break;
  }

  if (!imageUrl) continue;

  const next = entry.replace(/https:\/\/example\.com\/[^'\]]+/g, imageUrl);
  if (next !== entry) {
    updated = updated.replace(entry, next);
    replaced += 1;
  }
}

if (updated !== source) {
  await fs.writeFile(filePath, updated, 'utf8');
}

console.log(`Checked: ${checked}`);
console.log(`Updated entries: ${replaced}`);
