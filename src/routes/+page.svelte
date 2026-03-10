<script lang="ts">
  import { synths, totalModels, totalGems, series, brands } from '$lib/data/synths';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import SynthGrid from '$lib/components/SynthGrid.svelte';
</script>

<svelte:head>
  <title>Энциклопедия Винтажных Синтезаторов</title>
  <meta name="description" content="Полная база Yamaha, Casio, Bontempi (1970–1980‑е). Каталог винтажных синтезаторов с фото и характеристиками." />
</svelte:head>

<header class="main-header">
  <div class="header-content">
    <h1>🎹 Энциклопедия Винтажных Синтезаторов</h1>
    <div class="version">v3.0</div>
    <p class="subtitle">Полная база Yamaha, Casio, Bontempi (1970‑е–1980‑е) • автообновляемый каталог</p>
  </div>
</header>

<main>
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

  <FilterPanel />

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
  .main-header {
    text-align: center;
    padding: 2rem 1rem;
    background: rgba(0,0,0,0.3);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .header-content h1 {
    margin: 0;
    font-size: 2rem;
    text-shadow: 0 0 10px rgba(74, 144, 226, 0.5);
  }
  .version {
    display: inline-block;
    background: #4a90e2;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  .subtitle {
    color: #aaa;
    margin-top: 0.5rem;
  }
  .stats {
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding: 1rem;
    background: rgba(0,0,0,0.2);
  }
  .stat-item {
    text-align: center;
  }
  .stat-value {
    display: block;
    font-size: 1.5rem;
    font-weight: bold;
    color: #4a90e2;
  }
  .stat-label {
    font-size: 0.9rem;
    color: #888;
  }
  .catalog {
    padding: 1rem;
  }
  footer {
    text-align: center;
    padding: 1rem;
    color: #666;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
</style>