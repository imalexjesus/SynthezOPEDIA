import { synths } from '$lib/data/synths';

export const load = async ({ params }: { params: Record<string, string> }) => {
  const { brand, series, model } = params;
  
  // Найти модель по ID или по совпадению brand, series и modelName
  // ID format: {brand}-{series}-{model} (e.g., casio-sk-sk-1)
  const expectedId = `${brand}-${series}-${model}`;
  
  const synth = synths.find(s => 
    s.id === expectedId ||
    (
      s.brand.toLowerCase() === brand.toLowerCase() &&
      s.series.toLowerCase().includes(series.toLowerCase()) &&
      s.modelName.toLowerCase() === model.toLowerCase()
    )
  );
  
  if (!synth) {
    throw new Error(`Model not found: ${expectedId}`);
  }
  
  return { synth };
};