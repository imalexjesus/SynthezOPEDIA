import fs from 'node:fs/promises';

const filePath = 'src/lib/data/synths.ts';
const source = await fs.readFile(filePath, 'utf8');
const brands = ['yamaha', 'casio', 'roland', 'korg'];

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/&amp;/g, 'and')
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

async function indexBrand(brand) {
  const res = await fetch(`https://synthpedia.net/${brand}/`);
  if (!res.ok) return [];
  const html = await res.text();
  const re = new RegExp(`<a[^>]+href=\\"\\/${brand}\\/([^\\"\\/]+)\\/\\"[^>]*>([^<]+)<\\/a>`, 'g');
  const items = [];
  let m;
  while ((m = re.exec(html))) {
    const slug = m[1].trim();
    const title = m[2].trim();
    const key = normalize(title);
    if (!key) continue;
    items.push({ slug, title, key });
  }
  return items;
}

function pickSlug(modelName, items) {
  const modelKey = normalize(modelName);
  if (!modelKey) return null;

  const exact = items.filter((i) => i.key === modelKey);
  if (exact.length === 1) return exact[0].slug;

  const contained = items.filter((i) => i.key.includes(modelKey) || modelKey.includes(i.key));
  if (contained.length === 1) return contained[0].slug;

  return null;
}

function extractImage(html) {
  const cached = html.match(/https:\/\/images\.synthpedia\.net\/cached\/[^"']+/);
  if (cached) return cached[0];
  const small = html.match(/https:\/\/images\.synthpedia\.net\/small\/[^"']+/);
  return small ? small[0] : null;
}

const entries = [...source.matchAll(/  \{[\s\S]*?\n  \},/g)].map((m) => m[0]);
const brandData = new Map();
for (const brand of brands) brandData.set(brand, await indexBrand(brand));

let updated = source;
let checked = 0;
let replaced = 0;

for (const entry of entries) {
  if (!entry.includes('example.com')) continue;

  const brandMatch = entry.match(/brand: '([^']+)'/);
  const modelMatch = entry.match(/modelName: '([^']+)'/);
  if (!brandMatch || !modelMatch) continue;

  const brand = brandMatch[1].toLowerCase();
  const modelName = modelMatch[1];
  if (!brands.includes(brand)) continue;

  const slug = pickSlug(modelName, brandData.get(brand));
  if (!slug) continue;

  checked += 1;
  try {
    const res = await fetch(`https://synthpedia.net/${brand}/${slug}/`);
    if (!res.ok) continue;
    const html = await res.text();
    const imageUrl = extractImage(html);
    if (!imageUrl) continue;

    const nextEntry = entry.replace(/https:\/\/example\.com\/[^'\]]+/g, imageUrl);
    if (nextEntry !== entry) {
      updated = updated.replace(entry, nextEntry);
      replaced += 1;
    }
  } catch {
    // Ignore network errors.
  }
}

if (updated !== source) await fs.writeFile(filePath, updated, 'utf8');

console.log(`Checked: ${checked}`);
console.log(`Updated entries: ${replaced}`);
