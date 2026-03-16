import type { SynthModel } from '$lib/data/synths';

export const load = async ({ fetch }: { fetch: any }) => {
  const resp = await fetch('/api/synths');
  const data = await resp.json();
  const items: SynthModel[] = data.items || data;
  
  // Calculate stats
  const totalModels = items.length;
  const totalGems = items.filter((s) => s.isGem).length;
  
  // Extract unique brands and series
  const brands: string[] = [...new Set(items.map((s) => s.brand))];
  const seriesData = items.reduce((acc: Record<string, Set<string>>, s) => {
    if (!acc[s.brand]) acc[s.brand] = new Set();
    acc[s.brand].add(s.series);
    return acc;
  }, {});
  const series = Object.fromEntries(
    Object.entries(seriesData).map(([k, v]) => [k, [...v]])
  );
  
  return {
    synths: items,
    totalModels,
    totalGems,
    series,
    brands
  };
};
