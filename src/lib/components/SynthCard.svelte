<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  export let synth: SynthModel;
</script>

<a href="/synths/{synth.brand}/{synth.series}/{synth.modelName}" class="card">
  <img src={synth.images[0]} alt={synth.modelName} loading="lazy" />
  <div class="info">
    <h3>{synth.modelName}</h3>
    <p class="year">{synth.year}</p>
    <p class="specs">{synth.formFactor} • {synth.keysCount} клавиш • {synth.synthEngine}</p>
    {#if synth.isGem}<span class="gem">⭐ ГЕМ</span>{/if}
  </div>
</a>

<style>
  .card {
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
    transition: transform 0.2s, box-shadow 0.2s;
    text-decoration: none;
    color: inherit;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.4);
  }
  img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  .info { padding: 1rem; }
  .year { color: #888; font-size: 0.9em; }
  .specs { font-size: 0.85em; color: #ccc; }
  .gem { color: #ffd700; font-weight: bold; }
</style>