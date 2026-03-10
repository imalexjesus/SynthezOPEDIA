import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');

const entries = [...source.matchAll(/  \{[\s\S]*?\n  \},/g)].map((m) => m[0]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function searchCommons(query) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('list', 'search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('srsearch', query);
  url.searchParams.set('srlimit', '5');
  url.searchParams.set('srnamespace', '6');

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SynthezOPEDIA/1.0 (image enrichment)'
    }
  });
  if (!response.ok) return [];

  const json = await response.json();
  const results = json?.query?.search ?? [];

  return results
    .map((r) => r.title)
    .filter((title) => typeof title === 'string' && title.startsWith('File:'));
}

async function getImageUrl(fileTitle) {
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url');
  url.searchParams.set('format', 'json');
  url.searchParams.set('titles', fileTitle);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'SynthezOPEDIA/1.0 (image enrichment)'
    }
  });
  if (!response.ok) return null;

  const json = await response.json();
  const pages = json?.query?.pages;
  if (!pages) return null;

  const firstPage = Object.values(pages)[0];
  const image = firstPage?.imageinfo?.[0]?.url;
  return typeof image === 'string' ? image : null;
}

function pickBestTitle(titles, modelName) {
  if (!titles.length) return null;

  const model = modelName.toLowerCase();
  const exact = titles.find((t) => t.toLowerCase().includes(model));
  return exact ?? titles[0];
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
  const modelName = modelMatch[1];

  const queries = [
    `${brand} ${modelName}`,
    `${modelName} ${brand}`,
    `${brand} ${modelName} synthesizer`,
    `${modelName} keyboard`
  ];

  checked += 1;
  let imageUrl = null;

  for (const q of queries) {
    const titles = await searchCommons(q);
    const best = pickBestTitle(titles, modelName);
    if (!best) {
      await sleep(120);
      continue;
    }

    imageUrl = await getImageUrl(best);
    await sleep(120);
    if (imageUrl) break;
  }

  if (!imageUrl) continue;

  const nextEntry = entry.replace(/https:\/\/example\.com\/[^'\]]+/g, imageUrl);
  if (nextEntry !== entry) {
    updated = updated.replace(entry, nextEntry);
    replaced += 1;
  }
}

if (updated !== source) {
  await fs.writeFile(filePath, updated, 'utf8');
}

console.log(`Checked: ${checked}`);
console.log(`Updated entries: ${replaced}`);
