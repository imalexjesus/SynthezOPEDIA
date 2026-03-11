<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  import { calculateInflation, formatUAH, formatUSD } from '$lib/utils/economy';

  export let synth: SynthModel;

  $: featureTags =
    synth.featureTags && synth.featureTags.length > 0
      ? synth.featureTags
      : [`${synth.keysCount} клавиш`, synth.synthEngine, synth.formFactor];

  $: releasePrice = synth.releasePriceUSD ?? null;
  $: inflation = releasePrice ? calculateInflation(releasePrice, synth.year) : null;
  $: stars = '★'.repeat(synth.popularity?.stars ?? 0) + '☆'.repeat(5 - (synth.popularity?.stars ?? 0));
</script>

<a href="/synths/{synth.brand}/{synth.series}/{synth.modelName}" class="card">
  <div class="media">
    <img src={synth.images[0]} alt={synth.modelName} loading="lazy" />
    <span class="badge badge-price">{releasePrice ? `$${releasePrice}` : 'н/д'}</span>
    <span class="badge badge-year">{synth.year}</span>
  </div>
  <div class="info">
    <h3>{synth.modelName}</h3>
    <div class="tag-row">
      {#each featureTags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
    <p class="specs">{synth.formFactor} • {synth.keysCount} клавиш • {synth.synthEngine}</p>
    <p class="inflation-line">
      {#if inflation}
        C поправкой на инфляцию: {formatUSD(inflation.adjustedUSD)} • {formatUAH(inflation.convertedUAH)}
      {:else}
        C поправкой на инфляцию: н/д • н/д
      {/if}
    </p>

    <div class="market-grid">
      <div class="market-item">
        <span class="label">США б/у:</span>
        <span class="value">{synth.marketPrices?.usaUsed ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">Украина б/у:</span>
        <span class="value">{synth.marketPrices?.uaUsed ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">OLX находка:</span>
        <span class="value">{synth.marketPrices?.olxLowest ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">Крутая покупка:</span>
        <span class="value">{synth.marketPrices?.coolDeal ?? 'н/д'}</span>
      </div>
    </div>

    <div class="popularity">
      <div class="pop-label">{synth.popularity?.label ?? 'Популярность среди энтузиастов'}</div>
      <div class="pop-stars">{stars}</div>
      <div class="pop-status">{synth.popularity?.status ?? 'Оценка будет добавлена'}</div>
    </div>

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
    display: block;
  }
  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0,0,0,0.4);
  }
  .media {
    position: relative;
  }
  img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  .badge {
    position: absolute;
    top: 10px;
    padding: 0.25rem 0.6rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 0.85rem;
    color: #fff;
  }
  .badge-price {
    left: 10px;
    background: #ff5459;
  }
  .badge-year {
    right: 10px;
    background: #32b8c6;
  }
  .info { padding: 1rem; }
  h3 {
    margin: 0 0 0.5rem;
  }
  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.55rem;
  }
  .tag {
    font-size: 0.72rem;
    border: 1px solid rgba(80, 220, 220, 0.45);
    color: #9cf2f2;
    border-radius: 999px;
    padding: 0.15rem 0.45rem;
  }
  .specs { font-size: 0.85em; color: #ccc; }
  .inflation-line {
    margin-top: 0.4rem;
    font-size: 0.8rem;
    color: #9cb4c5;
    padding-bottom: 0.7rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  .market-grid {
    margin-top: 0.7rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
  .market-item .label {
    display: block;
    font-size: 0.75rem;
    color: #8fa4b2;
  }
  .market-item .value {
    display: block;
    font-weight: 700;
    font-size: 0.9rem;
    color: #ecf3ff;
  }
  .popularity {
    margin-top: 0.75rem;
    background: rgba(50, 184, 198, 0.16);
    border-left: 3px solid #32b8c6;
    border-radius: 6px;
    padding: 0.55rem 0.65rem;
  }
  .pop-label {
    font-size: 0.68rem;
    text-transform: uppercase;
    color: #9fb7c5;
    letter-spacing: 0.4px;
    font-weight: 700;
  }
  .pop-stars {
    margin-top: 0.2rem;
    color: #ffd04f;
    letter-spacing: 1px;
  }
  .pop-status {
    margin-top: 0.2rem;
    font-weight: 700;
    color: #77e6ef;
    font-size: 0.9rem;
  }
  .gem { color: #ffd700; font-weight: bold; }
</style>
