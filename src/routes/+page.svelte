<script lang="ts">
  import { synths, totalModels, totalGems, series, brands } from '$lib/data/synths';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import SynthGrid from '$lib/components/SynthGrid.svelte';
  import { onMount } from 'svelte';
  
  let mounted = $state(false);
  onMount(() => { mounted = true; });
</script>

<svelte:head>
  <title>Энциклопедия Винтажных Синтезаторов</title>
  <meta name="description" content="Полная база Yamaha, Casio, Bontempi (1970–1980‑е). Каталог винтажных синтезаторов с фото и характеристиками." />
</svelte:head>

<main class:mounted>
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
    <FilterPanel />
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
    align-items: flex-start;
  }
  .filters-search-row :global(.filter-panel) {
    flex: 1;
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