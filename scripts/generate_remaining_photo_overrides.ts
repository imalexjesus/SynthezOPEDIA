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
  'yamaha-ps-ps-4',
  'yamaha-ps-ps-6',
  'yamaha-psr-psr-13',
  'yamaha-vss-vss-100',
  'yamaha-drum-rx-15',
  'yamaha-drum-rx-17',
  'yamaha-drum-rx-5'
];

const byId = new Map(synths.map((s) => [s.id, s]));

function normalize(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function trusted(url: string) {
  const u = url.toLowerCase();
  return (
    u.startsWith('https://') &&
    (u.includes('i.ebayimg.com') || u.includes('rvb-img.reverb.com') || u.includes('upload.wikimedia.org'))
  );
}

function searchImage(brand: string, modelName: string) {
  const query = `"${brand} ${modelName}" keyboard synthesizer`;
  const cmd = `firecrawl search "${query.replace(/"/g, '\\"')}" --sources images --limit 8 --json`;

  try {
    const raw = execSync(cmd, { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 });
    const json = JSON.parse(raw) as {
      data?: { images?: Array<{ title?: string; url?: string; imageUrl?: string }> };
    };

    const token = normalize(modelName);
    const loose = token.replace(/-/g, '');

    for (const hit of json.data?.images ?? []) {
      const imageUrl = (hit.imageUrl ?? '').trim();
      if (!trusted(imageUrl)) continue;

      const text = normalize(`${hit.title ?? ''} ${hit.url ?? ''} ${imageUrl}`);
      if (text.includes(token) || text.includes(loose)) return imageUrl;
    }
  } catch {
    return null;
  }

  return null;
}

const overrides: Record<string, string[]> = {};

for (const id of targetIds) {
  const synth = byId.get(id);
  if (!synth) continue;

  const image = searchImage(synth.brand, synth.modelName);
  if (!image) continue;
  overrides[id] = [image];
}

writeFileSync('.firecrawl/remaining-overrides.json', JSON.stringify(overrides, null, 2), 'utf8');
console.log(`generated ${Object.keys(overrides).length}`);
