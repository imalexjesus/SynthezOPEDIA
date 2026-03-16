import { writable, get } from 'svelte/store';
import type { SynthModel } from '$lib/data/synths';

export const searchQuery = writable('');
export const selectedBrand = writable<string | null>(null);
export const selectedSeries = writable<string | null>(null);
export const selectedFormFactor = writable<string | null>(null);
export const showGemsOnly = writable(false);

// Simple writable store for filtered synths
export const filteredSynths = writable<SynthModel[]>([]);

// Function to update filtered synths
export function updateFilteredSynths(synths: SynthModel[]) {
  const $query = get(searchQuery);
  const $brand = get(selectedBrand);
  const $series = get(selectedSeries);
  const $formFactor = get(selectedFormFactor);
  const $gemsOnly = get(showGemsOnly);
  
  const filtered = synths.filter(synth => {
    // Поиск
    if ($query) {
      const q = $query.toLowerCase();
      const match = 
        synth.modelName.toLowerCase().includes(q) ||
        synth.series.toLowerCase().includes(q) ||
        synth.brand.toLowerCase().includes(q) ||
        (synth.description && synth.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Фильтр по бренду
    if ($brand && synth.brand !== $brand) return false;
    // Фильтр по серии
    if ($series && synth.series !== $series) return false;
    // Фильтр по форм‑фактору
    if ($formFactor && synth.formFactor !== $formFactor) return false;
    // Фильтр по гемам
    if ($gemsOnly && !synth.isGem) return false;
    return true;
  });
  
  filteredSynths.set(filtered);
}

// Subscribe to filter changes
searchQuery.subscribe(() => {
  // Will be handled by parent
});

export function applyFilters(filters: {
  search?: string;
  brand?: string | null;
  series?: string | null;
  formFactor?: string | null;
  gemsOnly?: boolean;
}) {
  if (filters.search !== undefined) searchQuery.set(filters.search);
  if (filters.brand !== undefined) selectedBrand.set(filters.brand);
  if (filters.series !== undefined) selectedSeries.set(filters.series);
  if (filters.formFactor !== undefined) selectedFormFactor.set(filters.formFactor);
  if (filters.gemsOnly !== undefined) showGemsOnly.set(filters.gemsOnly);
}
