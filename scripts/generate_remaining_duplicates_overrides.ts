import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { synths } from '../src/lib/data/synths';

const targetIds = [
  'yamaha-ps-ps-11',
  'yamaha-ps-ps-12',
  'yamaha-ps-ps-13',
  'yamaha-ps-ps-14',
  'yamaha-ps-ps-16',
  'yamaha-ps-ps-17',
  'yamaha-ps-ps-18',
  'yamaha-ps-ps-19',
  'yamaha-pss-pss-270',
  'yamaha-pss-pss-270b',
  'yamaha-pss-pss-270c',
  'yamaha-pss-pss-680',
  'yamaha-pss-pss-1020',
  'yamaha-pss-pss-1030',
  'yamaha-psr-psr-13',
  'yamaha-drum-rx-15',
  'yamaha-drum-rx-17',
  'casio-pt-pt-1',
  'casio-pt-pt-30',
  'casio-pt-pt-50',
  'casio-mt-mt-70',
  'casio-mt-mt-240',
  'casio-mt-mt-250'
];

type Result = { data?: { images?: Array<{ title?: string; imageUrl?: string; url?: string }> } };

const byId = new Map(synths.map((s) => [s.id, s]));

function norm(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function allowed(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith('https://') &&
    (u.includes('i.ebayimg.com') || u.includes('rvb-img.reverb.com') || u.includes('upload.wikimedia.org')) &&
    !u.includes('ytimg.com') &&
    !u.includes('youtube.com') &&
    !u.includes('facebook')
  );
}

function search(query: string): Result {
  try {
    const escaped = query.replace(/"/g, '\\"');
    const cmd = `firecrawl search "${escaped}" --sources images --limit 12 --json`;
    const raw = execSync(cmd, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(raw) as Result;
  } catch {
    return {};
  }
}

function bestImage(brand: string, modelName: string): string | null {
  const queries = [
    `"${brand} ${modelName}" ebay`,
    `"${brand} ${modelName}" reverb`,
    `"${brand} ${modelName}" keyboard`
  ];

  const modelToken = norm(modelName);
  const loose = modelToken.replace(/-/g, '');
  let best: { url: string; score: number } | null = null;

  for (const q of queries) {
    const data = search(q);
    for (const hit of data.data?.images ?? []) {
      const img = (hit.imageUrl ?? '').trim();
      if (!allowed(img)) continue;

      const text = norm(`${hit.title ?? ''} ${hit.url ?? ''} ${img}`);
      if (!text.includes(norm(brand))) continue;
      if (!text.includes(modelToken) && !text.includes(loose)) continue;

      let score = 0;
      if (img.includes('upload.wikimedia.org')) score += 5;
      if (img.includes('i.ebayimg.com')) score += 4;
      if (img.includes('rvb-img.reverb.com')) score += 3;
      if ((hit.title ?? '').toLowerCase().includes('front')) score += 2;
      if ((hit.title ?? '').toLowerCase().includes('white')) score += 1;

      if (!best || score > best.score) best = { url: img, score };
    }
    if (best && best.score >= 7) break;
  }

  return best?.url ?? null;
}

const overrides: Record<string, string[]> = {};

for (const id of targetIds) {
  const s = byId.get(id);
  if (!s) continue;
  const url = bestImage(s.brand, s.modelName);
  if (!url) continue;
  if (url === s.images[0]) continue;
  overrides[id] = [url];
}

writeFileSync('.firecrawl/remaining-duplicate-overrides.json', JSON.stringify(overrides, null, 2), 'utf8');
console.log(`generated ${Object.keys(overrides).length}`);
