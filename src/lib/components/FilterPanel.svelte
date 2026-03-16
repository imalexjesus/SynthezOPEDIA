<script lang="ts">
  import { searchQuery, selectedBrand, selectedSeries, selectedFormFactor, showGemsOnly, applyFilters } from '$lib/stores/filters';
  import { brands, synths } from '$lib/data/synths';

  export let searchValue = '';
  let localBrand: string | null = null;
  let localSeries: string | null = null;
  let localFormFactor: string | null = null;
  let localGemsOnly = false;
  $: availableSeries = localBrand
    ? [...new Set(synths.filter((s) => s.brand === localBrand).map((s) => s.series))].sort((a, b) =>
        a.localeCompare(b)
      )
    : [];

  // Debounce search
  let debounceTimer: NodeJS.Timeout;
  $: {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      applyFilters({ search: searchValue });
    }, 300);
  }

  function updateBrand(brand: string | null) {
    localBrand = brand;
    localSeries = null; // сбросить серию при смене бренда
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
  <!-- Фильтры: главная группа -->
  <div class="filter-group">
    <button class:active={!localBrand && !localGemsOnly} on:click={() => { updateBrand(null); updateGemsOnly(false); }}>Все</button>
    <button class:active={localGemsOnly} on:click={() => updateGemsOnly(true)}>⭐ Только гемы</button>
  </div>

  <!-- Фильтры по бренду -->
  <div class="filter-group">
    {#each brands as brand}
      <button class:active={localBrand === brand} on:click={() => updateBrand(brand)}>{brand}</button>
    {/each}
  </div>

  <!-- Фильтры по форм‑фактору -->
  <div class="filter-group">
    <button class:active={localFormFactor === 'micro'} on:click={() => updateFormFactor('micro')}>📱 Микро</button>
    <button class:active={localFormFactor === 'mini'} on:click={() => updateFormFactor('mini')}>👜 Мини</button>
    <button class:active={localFormFactor === 'compact'} on:click={() => updateFormFactor('compact')}>💼 Компакт</button>
    <button class:active={localFormFactor === 'full'} on:click={() => updateFormFactor('full')}>💻 Полноразмер</button>
  </div>

  <!-- Фильтры по серии (только для выбранного бренда) -->
  {#if localBrand}
    <div class="filter-group series-group">
      <div class="series-header">Серии бренда {localBrand}</div>
      <button class:active={!localSeries} on:click={() => updateSeries(null)}>Все серии</button>
      {#each availableSeries as s}
        <button class:active={localSeries === s} on:click={() => updateSeries(s)}>{s}</button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .filter-panel {
    padding: 1rem;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }
  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
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
  }
  .series-group {
    width: 100%;
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
</style>
