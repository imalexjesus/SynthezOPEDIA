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

function normalizeToken(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function isBadSource(url: string) {
  const u = url.toLowerCase();
  return (
    !u.startsWith('https://') ||
    u.includes('ytimg.com') ||
    u.includes('youtube.com') ||
    u.includes('pinterest') ||
    u.includes('reddit') ||
    u.includes('redd.it') ||
    u.includes('external-preview.redd.it') ||
    u.includes('muzines.co.uk')
  );
}

function trustedHostBonus(url: string) {
  const u = url.toLowerCase();
  if (u.includes('upload.wikimedia.org')) return 5;
  if (u.includes('i.ebayimg.com')) return 4;
  if (u.includes('reverb.com') || u.includes('rvb-img.reverb.com')) return 3;
  return -2;
}

function matchScore(hit: ImageHit, brand: string, modelName: string) {
  const title = (hit.title ?? '').toLowerCase();
  const page = (hit.url ?? '').toLowerCase();
  const image = (hit.imageUrl ?? '').toLowerCase();
  const text = `${title} ${page} ${image}`;

  const brandOk = text.includes(brand.toLowerCase());
  const modelToken = normalizeToken(modelName);
  const modelTokenLoose = modelToken.replace(/-/g, '');
  const modelOk = text.includes(modelToken) || text.includes(modelTokenLoose);

  if (!brandOk || !modelOk) return -100;
  if (!hit.imageUrl || isBadSource(hit.imageUrl)) return -100;

  let score = 0;
  score += trustedHostBonus(image);
  if (page.includes('reverb')) score += 1;
  if (title.includes('keyboard') || title.includes('synth')) score += 2;
  if (title.includes('white') || title.includes('isolated')) score += 1;
  if (image.includes('thumb') || image.includes('/mqdefault')) score -= 2;

  return score;
}

function firecrawlImageSearch(query: string): SearchData {
  try {
    const escaped = query.split('"').join('\\"');
    const raw = execSync(`firecrawl search \"${escaped}\" --sources images --limit 8 --json`, {
      encoding: 'utf8',
      maxBuffer: 4 * 1024 * 1024
    });
    return JSON.parse(raw) as SearchData;
  } catch {
    return {};
  }
}

const counts = new Map<string, number>();
for (const s of synths) {
  const first = (s.images?.[0] ?? '').trim();
  if (!first) continue;
  counts.set(first, (counts.get(first) ?? 0) + 1);
}

const targets = synths.filter((s) => {
  const first = (s.images?.[0] ?? '').trim();
  return first && (counts.get(first) ?? 0) >= 4;
});

const overrides: Record<string, string[]> = {};

for (const s of targets) {
  const query = `\"${s.brand} ${s.modelName}\" keyboard synthesizer`;
  const data = firecrawlImageSearch(query);
  const candidates = (data.data?.images ?? [])
    .map((hit) => ({ hit, score: matchScore(hit, s.brand, s.modelName) }))
    .filter((x) => x.score >= 2)
    .sort((a, b) => b.score - a.score);

  if (!candidates.length) continue;

  const imageUrl = candidates[0].hit.imageUrl?.trim();
  if (!imageUrl) continue;
  if (imageUrl === s.images[0]) continue;
  overrides[s.id] = [imageUrl];
}

writeFileSync(
  'src/lib/data/photo-overrides.ts',
  `export const photoOverrides: Record<string, string[]> = ${JSON.stringify(overrides, null, 2)};\n`,
  'utf8'
);

console.log(`targets=${targets.length}`);
console.log(`overrides=${Object.keys(overrides).length}`);
