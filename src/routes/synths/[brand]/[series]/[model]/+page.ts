import { listSynths } from '$lib/server/synth-api';

export const load = async ({ params }: { params: Record<string, string> }) => {
  const { brand, series, model } = params;
  
  // Decode URL-encoded characters (e.g., %20 -> space)
  const decodedSeries = decodeURIComponent(series);
  const decodedModel = decodeURIComponent(model);
  
  // Get all synths from DB
  const allSynths = await listSynths();
  
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