export const load = async ({ fetch }: { fetch: any }) => {
  const resp = await fetch('/api/synths');
  const data = await resp.json();
  const items = data.items || data;
  
  // Calculate stats
  const totalModels = items.length;
  const totalGems = items.filter((s: any) => s.isGem).length;
  
  // Extract unique brands and series
  const brands = [...new Set(items.map((s: any) => s.brand))];
  const seriesData = items.reduce((acc: any, s: any) => {
    if (!acc[s.brand]) acc[s.brand] = new Set();
    acc[s.brand].add(s.series);
    return acc;
  }, {});
  const series = Object.fromEntries(
    Object.entries(seriesData).map(([k, v]: [string, any]) => [k, [...v]])
  );
  
  return {
    synths: items,
    totalModels,
    totalGems,
    series,
    brands
  };
};
