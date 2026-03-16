<script lang="ts">
  import { searchQuery, selectedBrand, selectedSeries, selectedFormFactor, showGemsOnly, applyFilters } from '$lib/stores/filters';
  import type { SynthModel } from '$lib/data/synths';

  let { synths = [], brands = [], searchValue = '' }: { synths?: SynthModel[]; brands?: string[]; searchValue?: string } = $props();
  
  let localBrand: string | null = $state(null);
  let localSeries: string | null = $state(null);
  let localFormFactor: string | null = $state(null);
  let localGemsOnly = $state(false);
  
  let availableSeries = $derived(
    localBrand
      ? [...new Set(synths.filter((s) => s.brand === localBrand).map((s) => s.series))].sort((a, b) =>
          a.localeCompare(b)
        )
      : []
  );

  // Debounce search
  let debounceTimer: NodeJS.Timeout;
  $effect(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      applyFilters({ search: searchValue });
    }, 300);
  });

  function updateBrand(brand: string | null) {
    localBrand = brand;
    localSeries = null;
    applyFilters({ brand, series: null });
  }

  function updateSeries(series: string | null) {
    localSeries = series;
    applyFilters({ series });
  }

  function updateFormFactor(formFactor: string | null) {
    localFormFactor = formFactor;
    applyFilters({ formFactor });
  }

  function updateGemsOnly(gemsOnly: boolean) {
    localGemsOnly = gemsOnly;
    applyFilters({ gemsOnly });
  }
</script>

<div class="filter-panel">
  <!-- Row 1: Main filters -->
  <div class="filter-row">
    <div class="filter-group">
      <button class:active={!localBrand && !localGemsOnly} onclick={() => { updateBrand(null); updateGemsOnly(false); }}>Все</button>
      <button class:active={localGemsOnly} onclick={() => updateGemsOnly(true)}>⭐ Только гемы</button>
    </div>
    <div class="filter-group">
      <button class:active={localFormFactor === 'micro'} onclick={() => updateFormFactor('micro')}>📱 Микро</button>
      <button class:active={localFormFactor === 'mini'} onclick={() => updateFormFactor('mini')}>👜 Мини</button>
      <button class:active={localFormFactor === 'compact'} onclick={() => updateFormFactor('compact')}>💼 Компакт</button>
      <button class:active={localFormFactor === 'full'} onclick={() => updateFormFactor('full')}>💻 Полноразмер</button>
    </div>
  </div>

  <!-- Row 2: Brands -->
  <div class="filter-row">
    <div class="filter-group brands">
      {#each brands as brand}
        <button class:active={localBrand === brand} onclick={() => updateBrand(brand)}>{brand}</button>
      {/each}
    </div>
  </div>

  <!-- Row 3: Series (only for selected brand) -->
  {#if localBrand}
    <div class="filter-row">
      <div class="filter-group series-group">
        <div class="series-header">Серии бренда {localBrand}</div>
        <button class:active={!localSeries} onclick={() => updateSeries(null)}>Все серии</button>
        {#each availableSeries as s}
          <button class:active={localSeries === s} onclick={() => updateSeries(s)}>{s}</button>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  .filter-panel {
    padding: 1rem;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .filter-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: center;
  }
  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  .filter-group.brands {
    gap: 0.3rem;
  }
  .filter-group button {
    padding: 0.4rem 0.8rem;
    border: none;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    color: #aaa;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.85rem;
  }
  .filter-group button:hover {
    background: rgba(255,255,255,0.15);
    color: #fff;
  }
  .filter-group button.active {
    background: #4a90e2;
    color: white;
  }
  .series-header {
    color: #888;
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    margin-right: 0.5rem;
  }
  .series-group {
    width: 100%;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
</style>
