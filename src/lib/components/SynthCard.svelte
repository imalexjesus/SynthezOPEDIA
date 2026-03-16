<script lang="ts">
  import type { SynthModel } from '$lib/data/synths';
  import { calculateInflation, formatUAH, formatUSD } from '$lib/utils/economy';
  import { onMount } from 'svelte';

  export let synth: SynthModel;
  
  let cachedImageUrl: string | null = null;

  onMount(() => {
    // Cache the first image if it exists
    if (synth.images && synth.images.length > 0) {
      cacheImage(synth.images[0]);
    }
  });

  async function cacheImage(imageUrl: string) {
    try {
      const response = await fetch(`/api/cache-image?url=${encodeURIComponent(imageUrl)}`);
      const data = await response.json();
      if (data.url) {
        cachedImageUrl = data.url;
      }
    } catch (error) {
      console.error('Error caching image:', error);
    }
  }

  function normalizeTag(text: string) {
    return text.toLowerCase().replace(/[^a-zа-я0-9]+/gi, ' ').trim();
  }

  function formFactorLabel(formFactor: SynthModel['formFactor']) {
    if (formFactor === 'micro') return 'micro';
    if (formFactor === 'mini') return 'mini';
    if (formFactor === 'compact') return 'compact';
    return 'full';
  }

  function buildFeatureTags(model: SynthModel) {
    const source = model.featureTags && model.featureTags.length > 0 ? model.featureTags : [];
    const derived = [`${model.keysCount} клавиш`, model.synthEngine, formFactorLabel(model.formFactor)];
    const merged = [...source, ...derived];

    const seen = new Set<string>();
    const result: string[] = [];

    for (const raw of merged) {
      const tag = raw.trim();
      if (!tag) continue;

      let semanticKey = normalizeTag(tag);
      const lower = tag.toLowerCase();

      if (lower.includes('клав')) semanticKey = `keys:${model.keysCount}`;
      if (normalizeTag(model.synthEngine).length > 0 && normalizeTag(tag).includes(normalizeTag(model.synthEngine))) {
        semanticKey = `engine:${normalizeTag(model.synthEngine)}`;
      }
      if (lower === 'micro' || lower === 'mini' || lower === 'compact' || lower === 'full') {
        semanticKey = `form:${formFactorLabel(model.formFactor)}`;
      }

      if (seen.has(semanticKey)) continue;
      seen.add(semanticKey);
      result.push(tag);
    }

    return result;
  }

  $: featureTags = buildFeatureTags(synth);

  $: releasePrice = synth.releasePriceUSD ?? null;
  // Note: calculateInflation is now async. We handle it in the template.
  $: stars = '★'.repeat(synth.popularity?.stars ?? 0) + '☆'.repeat(5 - (synth.popularity?.stars ?? 0));
</script>

<a href="/synths/{synth.brand}/{synth.series}/{synth.modelName}" class="card" class:gem-card={synth.isGem}>
  <div class="media">
    <img 
      src={cachedImageUrl || (synth.images && synth.images[0] ? synth.images[0] : '')} 
      alt={synth.modelName} 
      loading="lazy" 
      decoding="async"
    />
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

    <div class="market-grid">
      <div class="market-item">
        <span class="label">🇺🇸 США б/у:</span>
        <span class="value">{synth.marketPrices?.usaUsed ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">🇺🇦 Украина б/у:</span>
        <span class="value">{synth.marketPrices?.uaUsed ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">🔎 OLX находка:</span>
        <span class="value">{synth.marketPrices?.olxLowest ?? 'н/д'}</span>
      </div>
      <div class="market-item">
        <span class="label">🎯 Крутая покупка:</span>
        <span class="value">{synth.marketPrices?.coolDeal ?? 'н/д'}</span>
      </div>
    </div>

    <div class="price-summary">
      <div class="price-col">
        <div class="summary-label">
          цена
          <span class="hint" title={`Цена на момент выхода модели (${synth.year})`}>ⓘ</span>
        </div>
        <div class="summary-value">{releasePrice ? formatUSD(releasePrice) : 'н/д'}</div>
      </div>
      <div class="price-col">
        <div class="summary-label">
          цена была бы сейчас
          <span
            class="hint"
            title="Цена на момент выхода модели с учетом инфляции, какой была бы сейчас"
            >ⓘ</span
          >
        </div>
        <div class="summary-value">
          {#if releasePrice}
            {#await calculateInflation(releasePrice, synth.year)}
              <span>Calculating...</span>
            {:then inflation}
              {formatUSD(inflation.adjustedUSD)}
              <span class="uah-inline">({formatUAH(inflation.convertedUAH)})</span>
            {:catch}
              н/д
            {/await}
          {:else}
            н/д
          {/if}
        </div>
      </div>
    </div>

    <div class="popularity">
      <div class="pop-label">{synth.popularity?.label ?? 'Популярность среди энтузиастов'}</div>
      <div class="pop-stars">{stars}</div>
      <div class="pop-status">{synth.popularity?.status ?? 'Оценка будет добавлена'}</div>
    </div>
  </div>
</a>

<style>
  .card {
    background: linear-gradient(145deg, #1a1a2e, #16213e);
    border-radius: 8px;
    overflow: hidden;
    border: 1px ridge rgba(255,255,255,0.1);
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
  .card.gem-card {
    background: linear-gradient(145deg, #1a1a2e, #241748 45%, #1f1b3d);
    border: 2px solid rgba(255, 214, 121, 0.72);
    box-shadow:
      0 0 0 2px rgba(255, 214, 121, 0.18),
      0 10px 18px rgba(0, 0, 0, 0.48),
      0 0 0 1px rgba(255, 214, 121, 0.24) inset;
  }
  .card.gem-card .info {
    background: linear-gradient(180deg, rgba(255, 214, 121, 0.06), rgba(255, 214, 121, 0.02));
  }
  .card.gem-card h3,
  .card.gem-card .market-item .value {
    color: #fff2cb;
  }
  .card.gem-card .tag {
    border-color: rgba(255, 214, 121, 0.45);
    color: #ffe6a3;
  }
  .card.gem-card .popularity {
    background: rgba(255, 214, 121, 0.18);
    border-left-color: rgba(255, 214, 121, 0.85);
    box-shadow: 0 0 0 1px rgba(255, 214, 121, 0.26) inset;
  }
  .card.gem-card .summary-label {
    color: #e6d09a;
  }
  .card.gem-card .summary-value {
    color: #fff2cb;
  }
  .card.gem-card .uah-inline {
    color: #e5cb89;
  }
  .card.gem-card .pop-label {
    color: #e6d09a;
  }
  .card.gem-card .pop-status {
    color: #ffe4a0;
  }
  .media {
    position: relative;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    min-height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  img {
    width: 100%;
    height: 160px;
    object-fit: cover;
  }
  img[src=""] {
    display: none;
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
    right: 10px;
    top: 44px;
    background: #ff5459;
  }
  .badge-year {
    right: 10px;
    background: #32b8c6;
  }
  .info {
    padding: 1rem;
    display: flex;
    flex-direction: column;
  }
  h3 {
    margin: 0 0 0.5rem;
    text-align: center;
    font-size: 1.05rem;
    font-weight: 500;
  }
  .tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-bottom: 0.55rem;
    justify-content: center;
    align-items: flex-start;
    min-height: 50px;
    align-content: flex-start;
  }
  .tag {
    font-size: 0.72rem;
    border: 1px solid rgba(80, 220, 220, 0.45);
    color: #9cf2f2;
    border-radius: 999px;
    padding: 0.15rem 0.45rem;
  }
  .market-grid {
    margin-top: 0.15rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.6rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    padding-top: 20px;
    min-height: 126px;
  }
  .market-item {
    min-height: 56px;
    text-align: center;
  }
  .market-item .label {
    display: block;
    font-size: 0.75rem;
    color: #8fa4b2;
  }
  .market-item .value {
    display: block;
    font-weight: 700;
    font-size: 0.98rem;
    color: #ecf3ff;
    min-height: 24px;
  }
  .price-summary {
    margin-top: 0.55rem;
    padding-top: 0.55rem;
    border-top: 1px solid rgba(255, 255, 255, 0.12);
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;
  }
  .summary-label {
    font-size: 0.74rem;
    color: #9fb4c4;
    text-transform: lowercase;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.25rem;
  }
  .hint {
    font-size: 0.72rem;
    color: #79c8f0;
    cursor: help;
    border: 1px solid rgba(121, 200, 240, 0.5);
    border-radius: 50%;
    width: 16px;
    height: 16px;
    line-height: 14px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
  }
  .summary-value {
    margin-top: 0.2rem;
    text-align: center;
    font-size: 0.98rem;
    font-weight: 700;
    color: #ecf3ff;
    min-height: 24px;
  }
  .uah-inline {
    font-size: 0.78rem;
    font-weight: 500;
    color: #a5bfd0;
    margin-left: 0.2rem;
  }
  .popularity {
    margin-top: 0.65rem;
    background: rgba(50, 184, 198, 0.1);
    border-left: 2px solid rgba(50, 184, 198, 0.55);
    border-radius: 6px;
    padding: 0.45rem 0.55rem;
  }
  .pop-label {
    font-size: 0.58rem;
    text-transform: uppercase;
    color: #9fb7c5;
    letter-spacing: 0.2px;
    font-weight: 500;
    text-align: center;
  }
  .pop-stars {
    margin-top: 0.14rem;
    color: #ffd04f;
    letter-spacing: 1px;
    text-align: center;
  }
  .pop-status {
    margin-top: 0.12rem;
    font-weight: 600;
    color: #94dce2;
    font-size: 0.84rem;
    text-align: center;
  }
</style>
