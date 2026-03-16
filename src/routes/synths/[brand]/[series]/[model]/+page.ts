import { synths } from '$lib/data/synths';

export const load = async ({ params }: { params: Record<string, string> }) => {
  const { brand, series, model } = params;
  
  // Decode URL-encoded characters (e.g., %20 -> space)
  const decodedSeries = decodeURIComponent(series);
  const decodedModel = decodeURIComponent(model);
  
  // Найти модель по ID или по совпадению brand, series и modelName
  // ID format: {brand}-{series}-{model} (e.g., casio-sk-sk-1)
  // Note: series in ID might be different from full series name (e.g., "pss" vs "PSS (PortaSound)")
  const expectedId = `${brand}-${series}-${model}`;
  
  const synth = synths.find(s => 
    s.id === expectedId ||
    s.id === `${brand}-${decodedSeries.toLowerCase().replace(/[^a-z0-9]/g, '')}-${decodedModel.toLowerCase()}` ||
    (
      s.brand.toLowerCase() === brand.toLowerCase() &&
      s.series.toLowerCase().includes(decodedSeries.toLowerCase()) &&
      s.modelName.toLowerCase() === decodedModel.toLowerCase()
    )
  );
  
  if (!synth) {
    throw new Error(`Model not found: ${expectedId} (tried: ${brand}/${decodedSeries}/${decodedModel})`);
  }
  
  return { synth };
};