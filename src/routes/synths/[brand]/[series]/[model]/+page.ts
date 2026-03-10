import { synths } from '$lib/data/synths';

export const load = async ({ params }: { params: Record<string, string> }) => {
  const { brand, series, model } = params;
  // Найти модель по совпадению brand, series и modelName (model может быть с дефисами, например PSS-470)
  const synth = synths.find(s => 
    s.brand.toLowerCase() === brand.toLowerCase() &&
    s.series.toLowerCase() === series.toLowerCase() &&
    s.modelName.toLowerCase() === model.toLowerCase()
  );
  
  if (!synth) {
    throw new Error('Model not found');
  }
  
  return { synth };
};