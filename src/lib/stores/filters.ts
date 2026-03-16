import { writable, get } from 'svelte/store';
import type { SynthModel } from '$lib/data/synths';

export const searchQuery = writable('');
export const selectedBrand = writable<string | null>(null);
export const selectedSeries = writable<string | null>(null);
export const selectedFormFactor = writable<string | null>(null);
export const showGemsOnly = writable(false);
export const filteredSynths = writable<SynthModel[]>([]);

function applyFiltersInternal(currentSynths: SynthModel[]) {
  const query = get(searchQuery);
  const brand = get(selectedBrand);
  const series = get(selectedSeries);
  const formFactor = get(selectedFormFactor);
  const gemsOnly = get(showGemsOnly);
  
  const filtered = currentSynths.filter(synth => {
    // Search
    if (query) {
      const q = query.toLowerCase();
      const match = 
        synth.modelName.toLowerCase().includes(q) ||
        synth.series.toLowerCase().includes(q) ||
        synth.brand.toLowerCase().includes(q) ||
        (synth.description && synth.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Filter by brand
    if (brand && synth.brand !== brand) return false;
    // Filter by series
    if (series && synth.series !== series) return false;
    // Filter by form factor
    if (formFactor && synth.formFactor !== formFactor) return false;
    // Filter by gems
    if (gemsOnly && !synth.isGem) return false;
    return true;
  });
  
  filteredSynths.set(filtered);
}

export function initFilters(synths: SynthModel[]) {
  applyFiltersInternal(synths);
}

export function applyFilters(filters: {
  search?: string;
  brand?: string | null;
  series?: string | null;
  formFactor?: string | null;
  gemsOnly?: boolean;
}, currentSynths: SynthModel[]) {
  if (filters.search !== undefined) {
    searchQuery.set(filters.search);
  }
  if (filters.brand !== undefined) {
    selectedBrand.set(filters.brand);
    if (filters.brand) selectedSeries.set(null);
  }
  if (filters.series !== undefined) {
    selectedSeries.set(filters.series);
  }
  if (filters.formFactor !== undefined) {
    selectedFormFactor.set(filters.formFactor);
  }
  if (filters.gemsOnly !== undefined) {
    showGemsOnly.set(filters.gemsOnly);
  }
  applyFiltersInternal(currentSynths);
}
