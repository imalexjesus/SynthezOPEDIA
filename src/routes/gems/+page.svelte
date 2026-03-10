<script lang="ts">
  import { synths } from '$lib/data/synths';
  import SynthCard from '$lib/components/SynthCard.svelte';
  
  // Получаем гемы (isGem === true)
  const gems = synths.filter(s => s.isGem);
  
  // Сортируем по году (старые сначала) или можно по другому критерию
  const sortedGems = [...gems].sort((a, b) => a.year - b.year);
</script>

<svelte:head>
  <title>Топ‑гемы коллекции - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="gems-page">
  <h1>⭐ Топ‑гемы коллекции</h1>
  <p>Самые культовые модели винтажных синтезаторов: редкость, уникальность звучания, историческая значимость.</p>

  <div class="gems-grid">
    {#each sortedGems as gem, index}
      <div class="gem-item">
        <div class="rank">#{index + 1}</div>
        <SynthCard synth={gem} />
      </div>
    {:else}
      <p>Гемы коллекции пока не добавлены.</p>
    {/each}
  </div>
</main>

<style>
  .gems-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  h1 {
    text-align: center;
  }
  .gems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
  .gem-item {
    position: relative;
  }
  .rank {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    background: #ffd700;
    color: #333;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-weight: bold;
    z-index: 10;
  }
</style>