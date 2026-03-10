import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');

const entryRegex = /  \{[\s\S]*?\n  \},/g;
const entries = [...source.matchAll(entryRegex)];

let updated = source;
let replaced = 0;
let checked = 0;

function slugify(modelName) {
  return modelName
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractImageUrl(html) {
  const cached = html.match(/https:\/\/images\.synthpedia\.net\/cached\/[^"']+/);
  if (cached) return cached[0];

  const small = html.match(/https:\/\/images\.synthpedia\.net\/small\/[^"']+/);
  return small ? small[0] : null;
}

for (const match of entries) {
  const block = match[0];
  if (!block.includes('example.com')) continue;

  const brandMatch = block.match(/brand: '([^']+)'/);
  const modelMatch = block.match(/modelName: '([^']+)'/);
  if (!brandMatch || !modelMatch) continue;

  const brand = brandMatch[1].toLowerCase();
  if (!['yamaha', 'casio', 'roland', 'korg'].includes(brand)) continue;

  const model = modelMatch[1];
  const slug = slugify(model);
  const url = `https://synthpedia.net/${brand}/${slug}/`;

  checked += 1;

  try {
    const response = await fetch(url);
    if (!response.ok) continue;

    const html = await response.text();
    const imageUrl = extractImageUrl(html);
    if (!imageUrl) continue;

    const replacedBlock = block.replace(/https:\/\/example\.com\/[^'\]]+/, imageUrl);
    if (replacedBlock !== block) {
      updated = updated.replace(block, replacedBlock);
      replaced += 1;
    }
  } catch {
    // Ignore transient network errors per-model.
  }
}

if (updated !== source) {
  await fs.writeFile(filePath, updated, 'utf8');
}

console.log(`Checked: ${checked}`);
console.log(`Replaced: ${replaced}`);
