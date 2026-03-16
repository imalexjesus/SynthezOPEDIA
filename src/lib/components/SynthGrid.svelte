<script lang="ts">
  import { filteredSynths } from '$lib/stores/filters';
  import SynthCard from './SynthCard.svelte';
</script>

<div class="grid">
  {#each $filteredSynths as synth (synth.id)}
    <SynthCard {synth} />
  {:else}
    <p>Ничего не найдено.</p>
  {/each}
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 1rem;
  }
</style>
