import { get } from 'svelte/store';
import type { SynthModel } from '$lib/data/synths';

// Filter state using Svelte 5 runes approach
let searchQuery = $state('');
let selectedBrand = $state<string | null>(null);
let selectedSeries = $state<string | null>(null);
let selectedFormFactor = $state<string | null>(null);
let showGemsOnly = $state(false);
let currentSynths = $state<SynthModel[]>([]);
let filteredSynths = $state<SynthModel[]>([]);

export function getSearchQuery() { return searchQuery; }
export function getSelectedBrand() { return selectedBrand; }
export function getSelectedSeries() { return selectedSeries; }
export function getSelectedFormFactor() { return selectedFormFactor; }
export function getShowGemsOnly() { return showGemsOnly; }

export function setSearchQuery(v: string) { 
  searchQuery = v; 
  applyFiltersInternal();
}
export function setSelectedBrand(v: string | null) { 
  selectedBrand = v; 
  if (v) selectedSeries = null;
  applyFiltersInternal();
}
export function setSelectedSeries(v: string | null) { 
  selectedSeries = v; 
  applyFiltersInternal();
}
export function setSelectedFormFactor(v: string | null) { 
  selectedFormFactor = v; 
  applyFiltersInternal();
}
export function setShowGemsOnly(v: boolean) { 
  showGemsOnly = v; 
  applyFiltersInternal();
}

function applyFiltersInternal() {
  const filtered = currentSynths.filter(synth => {
    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = 
        synth.modelName.toLowerCase().includes(q) ||
        synth.series.toLowerCase().includes(q) ||
        synth.brand.toLowerCase().includes(q) ||
        (synth.description && synth.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    // Filter by brand
    if (selectedBrand && synth.brand !== selectedBrand) return false;
    // Filter by series
    if (selectedSeries && synth.series !== selectedSeries) return false;
    // Filter by form factor
    if (selectedFormFactor && synth.formFactor !== selectedFormFactor) return false;
    // Filter by gems
    if (showGemsOnly && !synth.isGem) return false;
    return true;
  });
  
  filteredSynths = filtered;
}

export function initFilters(synths: SynthModel[]) {
  currentSynths = synths;
  applyFiltersInternal();
}

export function getFilteredSynths() {
  return filteredSynths;
}

// Legacy exports for compatibility
export { filteredSynths, searchQuery, selectedBrand, selectedSeries, selectedFormFactor, showGemsOnly };

export function applyFilters(filters: {
  search?: string;
  brand?: string | null;
  series?: string | null;
  formFactor?: string | null;
  gemsOnly?: boolean;
}) {
  if (filters.search !== undefined) {
    searchQuery = filters.search;
  }
  if (filters.brand !== undefined) {
    selectedBrand = filters.brand;
    if (filters.brand) selectedSeries = null;
  }
  if (filters.series !== undefined) {
    selectedSeries = filters.series;
  }
  if (filters.formFactor !== undefined) {
    selectedFormFactor = filters.formFactor;
  }
  if (filters.gemsOnly !== undefined) {
    showGemsOnly = filters.gemsOnly;
  }
  applyFiltersInternal();
}
