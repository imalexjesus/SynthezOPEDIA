export const load = async ({ fetch }: { fetch: any }) => {
  const resp = await fetch('/api/synths');
  const data = await resp.json();
  const items = data.items || data;
  const gems = items.filter((s: any) => s.isGem).sort((a: any, b: any) => a.year - b.year);
  return { gems };
};
