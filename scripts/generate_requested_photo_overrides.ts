import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { synths } from '../src/lib/data/synths';

const requestedIds = [
  'yamaha-pss-pss-470',
  'yamaha-pss-pss-480',
  'yamaha-pss-pss-490',
  'yamaha-pss-pss-f30',
  'yamaha-pss-pss-m30',
  'yamaha-pss-pss-f50',
  'yamaha-ps-ps-4',
  'yamaha-ps-ps-5',
  'yamaha-ps-ps-6',
  'yamaha-ps-ps-7',
  'yamaha-ps-ps-8',
  'yamaha-ps-ps-9',
  'yamaha-psr-psr-60'
];

type SearchOut = {
  data?: {
    images?: Array<{ title?: string; imageUrl?: string; url?: string }>;
  };
};

const byId = new Map(synths.map((s) => [s.id, s]));

function norm(v: string) {
  return v.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function allowed(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith('https://') &&
    (u.includes('i.ebayimg.com') || u.includes('rvb-img.reverb.com') || u.includes('upload.wikimedia.org')) &&
    !u.includes('ytimg.com')
  );
}

function score(hit: { title?: string; imageUrl?: string; url?: string }, brand: string, modelName: string) {
  const image = (hit.imageUrl ?? '').trim();
  if (!allowed(image)) return -100;

  const text = norm(`${hit.title ?? ''} ${hit.url ?? ''} ${image}`);
  const b = norm(brand);
  const m = norm(modelName);
  const mLoose = m.replace(/-/g, '');

  if (!text.includes(b)) return -100;
  if (!text.includes(m) && !text.includes(mLoose)) return -100;

  let s = 0;
  if (image.includes('upload.wikimedia.org')) s += 5;
  if (image.includes('i.ebayimg.com')) s += 4;
  if (image.includes('rvb-img.reverb.com')) s += 3;
  const t = (hit.title ?? '').toLowerCase();
  if (t.includes('keyboard') || t.includes('synth')) s += 1;
  if (t.includes('front') || t.includes('isolated') || t.includes('white')) s += 2;
  return s;
}

function search(query: string): SearchOut {
  try {
    const cmd = `firecrawl search "${query.replace(/"/g, '\\"')}" --sources images --limit 10 --json`;
    const out = execSync(cmd, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    return JSON.parse(out) as SearchOut;
  } catch {
    return {};
  }
}

const result: Record<string, string[]> = {};

for (const id of requestedIds) {
  const s = byId.get(id);
  if (!s) continue;

  const queries = [
    `"${s.brand} ${s.modelName}" keyboard white background`,
    `"${s.brand} ${s.modelName}" synthesizer`,
    `${s.brand} ${s.modelName} reverb ebay`
  ];

  let bestUrl: string | null = null;
  let bestScore = -100;

  for (const q of queries) {
    const data = search(q);
    for (const hit of data.data?.images ?? []) {
      const sc = score(hit, s.brand, s.modelName);
      if (sc > bestScore && hit.imageUrl) {
        bestScore = sc;
        bestUrl = hit.imageUrl;
      }
    }
    if (bestScore >= 7) break;
  }

  if (bestUrl) result[id] = [bestUrl];
}

writeFileSync('.firecrawl/requested-photo-overrides.json', JSON.stringify(result, null, 2), 'utf8');
console.log(`generated ${Object.keys(result).length}`);
