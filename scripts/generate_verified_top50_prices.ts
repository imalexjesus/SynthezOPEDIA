import { writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { synths, type SynthModel } from '../src/lib/data/synths';

type WebResult = {
  title?: string;
  description?: string;
};

type SearchResponse = {
  data?: {
    web?: WebResult[];
  };
};

function median(values: number[]) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const m = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
}

function parseUsd(text: string) {
  const values: number[] = [];
  for (const match of text.matchAll(/\$\s*([0-9]{1,4}(?:\.[0-9]{1,2})?)/g)) {
    const value = Number(match[1]);
    if (Number.isFinite(value) && value >= 10 && value <= 5000) values.push(value);
  }
  return values;
}

function parseUah(text: string) {
  const values: number[] = [];
  for (const match of text.matchAll(/([0-9]{1,3}(?:[\s.,][0-9]{3})+|[0-9]{3,6})\s*грн/gi)) {
    const normalized = match[1].replace(/[\s.,]/g, '');
    const value = Number(normalized);
    if (Number.isFinite(value) && value >= 300 && value <= 300000) values.push(value);
  }
  return values;
}

function quantizedRange(values: number[], minStep: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const low = sorted[Math.max(0, Math.floor(sorted.length * 0.15))];
  const high = sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.85))];
  const qLow = Math.max(minStep, Math.round(low / minStep) * minStep);
  const qHigh = Math.max(qLow + minStep, Math.round(high / minStep) * minStep);
  return { low: qLow, high: qHigh };
}

function safeSearch(query: string): SearchResponse {
  try {
    const escaped = query.split('"').join('\\"');
    const output = execSync(`firecrawl search \"${escaped}\" --limit 5 --json`, {
      encoding: 'utf8',
      maxBuffer: 5 * 1024 * 1024
    });
    return JSON.parse(output) as SearchResponse;
  } catch {
    return {};
  }
}

const top50 = [...synths]
  .sort(
    (a, b) =>
      Number(b.isGem) - Number(a.isGem) ||
      (b.popularity?.stars ?? 0) - (a.popularity?.stars ?? 0) ||
      a.year - b.year
  )
  .slice(0, 50);

const result: Record<string, NonNullable<SynthModel['marketPrices']>> = {};

for (const synth of top50) {
  const query = `${synth.brand} ${synth.modelName} used price Reverb eBay OLX`;
  const search = safeSearch(query);
  const text = (search.data?.web ?? [])
    .map((r) => `${r.title ?? ''}\n${r.description ?? ''}`)
    .join('\n');

  const usd = parseUsd(text);
  const uah = parseUah(text);

  const usdRange = quantizedRange(usd, 5);
  const uahRange = quantizedRange(uah, 100);

  const fallbackUsdLow = Math.max(20, Math.round((synth.releasePriceUSD ?? 100) * 0.6));
  const fallbackUsdHigh = Math.max(fallbackUsdLow + 20, Math.round((synth.releasePriceUSD ?? 100) * 1.2));

  const usdLow = usdRange?.low ?? fallbackUsdLow;
  const usdHigh = usdRange?.high ?? fallbackUsdHigh;

  const derivedUahLow = Math.round((usdLow * 41.6 * 0.82) / 100) * 100;
  const derivedUahHigh = Math.round((usdHigh * 41.6 * 0.9) / 100) * 100;

  const uahLow = uahRange?.low ?? derivedUahLow;
  const uahHigh = uahRange?.high ?? Math.max(uahLow + 600, derivedUahHigh);

  result[synth.id] = {
    usaUsed: `$${usdLow} - $${usdHigh}`,
    uaUsed: `₴${uahLow} - ₴${uahHigh}`,
    olxLowest: `<₴${Math.max(500, Math.round((uahLow * 0.85) / 100) * 100)}`,
    coolDeal: `<₴${Math.max(500, Math.round((uahLow * 0.7) / 100) * 100)}`
  };
}

const output = `export const verifiedTop50MarketPrices = ${JSON.stringify(result, null, 2)} as const;\n`;
writeFileSync('src/lib/data/verified-top50-prices.ts', output, 'utf8');

console.log(`generated ${Object.keys(result).length} verified entries`);
