<script lang="ts">
  import { synths, totalModels, totalGems, series, brands } from '$lib/data/synths';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import SynthGrid from '$lib/components/SynthGrid.svelte';
  import { onMount } from 'svelte';
  
  let mounted = $state(false);
  let searchValue = $state('');
  
  onMount(() => { mounted = true; });
</script>

<svelte:head>
  <title>Энциклопедия Винтажных Синтезаторов</title>
  <meta name="description" content="Полная база Yamaha, Casio, Bontempi (1970–1980‑е). Каталог винтажных синтезаторов с фото и характеристиками." />
</svelte:head>

<main class:mounted>
  <header class="page-header">
    <h1>🎹 Энциклопедия Винтажных Синтезаторов <span class="version">v3.0</span></h1>
    <p class="subtitle">Полная база Yamaha, Casio, Bontempi (1970‑е–1980‑е)</p>
  </header>

  <section class="stats">
    <div class="stat-item">
      <span class="stat-value">{totalModels}</span>
      <span class="stat-label">Моделей</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{totalGems}</span>
      <span class="stat-label">Гемов коллекции</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{series.length}</span>
      <span class="stat-label">Серий</span>
    </div>
    <div class="stat-item">
      <span class="stat-value">{brands.length}</span>
      <span class="stat-label">Брендов</span>
    </div>
  </section>

  <div class="filters-search-row">
    <FilterPanel {searchValue} />
    <div class="search-box">
      <input type="text" bind:value={searchValue} placeholder="Поиск моделей..." />
    </div>
  </div>

  <section class="catalog">
    <SynthGrid />
  </section>
</main>

<footer>
  <p>© 2026 Энциклопедия Винтажных Синтезаторов. Данные собраны из открытых источников.</p>
</footer>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    color: #e0e0e0;
    min-height: 100vh;
  }
  main {
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.4s ease, transform 0.4s ease;
  }
  main.mounted {
    opacity: 1;
    transform: translateY(0);
  }
  .page-header {
    text-align: center;
    padding: 1.5rem 1rem 1rem;
  }
  h1 {
    margin: 0;
    font-size: 1.8rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .version {
    display: inline-block;
    background: #4a90e2;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: bold;
    margin-left: 0.5rem;
  }
  .subtitle {
    color: #888;
    margin-top: 0.5rem;
    font-size: 0.95rem;
  }
  .stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1.2rem;
    background: rgba(0,0,0,0.25);
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  .stat-item {
    text-align: center;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: transform 0.2s, background 0.2s;
  }
  .stat-item:hover {
    transform: translateY(-2px);
    background: rgba(74, 144, 226, 0.15);
  }
  .stat-value {
    display: block;
    font-size: 1.8rem;
    font-weight: bold;
    background: linear-gradient(135deg, #4a90e2, #7b68ee);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .stat-label {
    font-size: 0.85rem;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .filters-search-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    padding: 1rem;
  }
  .filters-search-row :global(.filter-panel) {
    flex: 1;
    align-items: flex-start;
  }
  .search-box {
    flex-shrink: 0;
    width: 350px;
    background-color: #06001c;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
  }
  .search-box input {
    width: 100%;
    padding: 0.5rem 0.8rem;
    border: none;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    color: white;
    font-size: 0.9rem;
  }
  .search-box input::placeholder {
    color: #666;
  }
  .catalog {
    padding: 1rem;
  }
  footer {
    text-align: center;
    padding: 1.5rem;
    color: #555;
    border-top: 1px solid rgba(255,255,255,0.05);
    font-size: 0.85rem;
  }
</style>