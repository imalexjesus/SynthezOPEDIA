export const load = async ({ params, fetch }: { params: Record<string, string>; fetch: any }) => {
  const { brand, series, model } = params;
  
  // Decode URL-encoded characters (e.g., %20 -> space)
  const decodedSeries = decodeURIComponent(series);
  const decodedModel = decodeURIComponent(model);
  
  // Get all synths from API
  const resp = await fetch('/api/synths?includeInactive=true');
  const data = await resp.json();
  const allSynths = data.items || data;
  
  // Try to find by ID first
  const expectedId = `${brand}-${series}-${model}`;
  let synth = allSynths.find((s: any) => s.id === expectedId);
  
  // If not found, try to find by brand/series/model match
  if (!synth) {
    synth = allSynths.find((s: any) => 
      s.brand.toLowerCase() === brand.toLowerCase() &&
      s.series.toLowerCase().includes(decodedSeries.toLowerCase()) &&
      s.modelName.toLowerCase() === decodedModel.toLowerCase()
    );
  }
  
  if (!synth) {
    throw new Error(`Model not found: ${brand}/${decodedSeries}/${decodedModel}`);
  }
  
  return { synth };
};