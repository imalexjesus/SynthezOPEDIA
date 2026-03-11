import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { synths } from '../src/lib/data/synths';

type ImageHit = {
  title?: string;
  imageUrl?: string;
  url?: string;
};

type SearchData = {
  data?: {
    images?: ImageHit[];
  };
};

function normalize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function trusted(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith('https://') &&
    (u.includes('i.ebayimg.com') ||
      u.includes('rvb-img.reverb.com') ||
      u.includes('upload.wikimedia.org') ||
      u.includes('images.synthpedia.net'))
  );
}

function reject(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes('ytimg.com') ||
    u.includes('youtube.com') ||
    u.includes('reddit.com') ||
    u.includes('redd.it') ||
    u.includes('pinterest')
  );
}

function score(hit: ImageHit, brand: string, modelName: string) {
  const title = (hit.title ?? '').toLowerCase();
  const page = (hit.url ?? '').toLowerCase();
  const image = (hit.imageUrl ?? '').toLowerCase();
  const text = normalize(`${title} ${page} ${image}`);

  const modelToken = normalize(modelName);
  const loose = modelToken.replace(/-/g, '');

  if (!text.includes(normalize(brand))) return -100;
  if (!text.includes(modelToken) && !text.includes(loose)) return -100;
  if (!hit.imageUrl || !trusted(hit.imageUrl) || reject(hit.imageUrl)) return -100;

  let s = 0;
  if (image.includes('upload.wikimedia.org')) s += 5;
  if (image.includes('i.ebayimg.com')) s += 4;
  if (image.includes('rvb-img.reverb.com')) s += 3;
  if (image.includes('images.synthpedia.net')) s += 2;
  if (title.includes('white') || title.includes('isolated') || title.includes('product')) s += 2;
  if (title.includes('front')) s += 1;
  if (title.includes('keyboard') || title.includes('synth')) s += 1;
  return s;
}

function searchImages(query: string): SearchData {
  try {
    const escaped = query.replace(/"/g, '\\"');
    const cmd = `firecrawl search "${escaped}" --sources images --limit 10 --json`;
    const raw = execSync(cmd, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(raw) as SearchData;
  } catch {
    return {};
  }
}

const gems = synths.filter((s) => s.isGem);
const overrides: Record<string, string[]> = {};

for (const synth of gems) {
  const queries = [
    `"${synth.brand} ${synth.modelName}" keyboard white background`,
    `"${synth.brand} ${synth.modelName}" synthesizer`,
    `${synth.brand} ${synth.modelName} reverb`
  ];

  let best: { url: string; score: number } | null = null;

  for (const q of queries) {
    const data = searchImages(q);
    for (const hit of data.data?.images ?? []) {
      const val = score(hit, synth.brand, synth.modelName);
      if (val < 2 || !hit.imageUrl) continue;
      if (!best || val > best.score) best = { url: hit.imageUrl, score: val };
    }
    if (best && best.score >= 7) break;
  }

  if (best && best.url !== synth.images[0]) {
    overrides[synth.id] = [best.url];
  }
}

writeFileSync(
  'src/lib/data/gem-photo-overrides.ts',
  `export const gemPhotoOverrides: Record<string, string[]> = ${JSON.stringify(overrides, null, 2)};\n`,
  'utf8'
);

console.log(`gems=${gems.length}`);
console.log(`overrides=${Object.keys(overrides).length}`);
