export const load = async ({ fetch }: { fetch: any }) => {
  const resp = await fetch('/api/synths');
  const data = await resp.json();
  const items = data.items || data;
  const allBrands = [...new Set(items.map((s: any) => s.brand))].sort();
  const allSeries = [...new Set(items.map((s: any) => s.series))].sort();
  return {
    synths: items,
    allBrands,
    allSeries
  };
};
