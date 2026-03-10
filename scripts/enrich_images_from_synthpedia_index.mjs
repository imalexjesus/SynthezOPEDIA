import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');
const supportedBrands = ['yamaha', 'casio', 'roland', 'korg'];

const entryRegex = /  \{[\s\S]*?\n  \},/g;
const entries = [...source.matchAll(entryRegex)].map((m) => m[0]);

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

async function buildProductIndex(brand) {
  const url = `https://synthpedia.net/${brand}/`;
  const response = await fetch(url);
  if (!response.ok) return new Map();

  const html = await response.text();
  const index = new Map();
  const anchorRegex = new RegExp(
    `<a[^>]+href=\\"\\/${brand}\\/([^\\"\\/]+)\\/\\"[^>]*>([^<]+)<\\/a>`,
    'g'
  );

  let match;
  while ((match = anchorRegex.exec(html))) {
    const slug = match[1].trim();
    const title = match[2].trim();
    const normalized = normalizeName(title);
    if (!normalized) continue;
    if (!index.has(normalized)) {
      index.set(normalized, slug);
    }
  }

  return index;
}

function findImageUrl(html) {
  const cached = html.match(/https:\/\/images\.synthpedia\.net\/cached\/[^"']+/);
  if (cached) return cached[0];

  const small = html.match(/https:\/\/images\.synthpedia\.net\/small\/[^"']+/);
  return small ? small[0] : null;
}

const brandIndexes = new Map();
for (const brand of supportedBrands) {
  brandIndexes.set(brand, await buildProductIndex(brand));
}

let updated = source;
let checked = 0;
let replaced = 0;

for (const entry of entries) {
  if (!entry.includes('example.com')) continue;

  const brandMatch = entry.match(/brand: '([^']+)'/);
  const modelMatch = entry.match(/modelName: '([^']+)'/);
  if (!brandMatch || !modelMatch) continue;

  const brand = brandMatch[1].toLowerCase();
  if (!supportedBrands.includes(brand)) continue;

  const modelName = modelMatch[1];
  const normalizedModel = normalizeName(modelName);
  const index = brandIndexes.get(brand);
  if (!index || !index.has(normalizedModel)) continue;

  const slug = index.get(normalizedModel);
  const productUrl = `https://synthpedia.net/${brand}/${slug}/`;
  checked += 1;

  try {
    const response = await fetch(productUrl);
    if (!response.ok) continue;

    const html = await response.text();
    const imageUrl = findImageUrl(html);
    if (!imageUrl) continue;

    const replacedEntry = entry.replace(/https:\/\/example\.com\/[^'\]]+/g, imageUrl);
    if (replacedEntry !== entry) {
      updated = updated.replace(entry, replacedEntry);
      replaced += 1;
    }
  } catch {
    // Ignore per-model network errors.
  }
}

if (updated !== source) {
  await fs.writeFile(filePath, updated, 'utf8');
}

console.log(`Checked: ${checked}`);
console.log(`Updated entries: ${replaced}`);
