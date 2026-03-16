<script lang="ts">
  import ImageGallery from '$lib/components/ImageGallery.svelte';
  import { calculateInflation, formatUAH, formatUSD } from '$lib/utils/economy';
  import { onMount } from 'svelte';
  
  export let data: { synth: import('$lib/data/synths').SynthModel };
  $: synth = data.synth;
  $: releasePrice = synth.releasePriceUSD ?? null;
  
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
      // Fallback to original URL if caching fails
      cachedImageUrl = imageUrl;
    }
  }
  // inflation is now handled asynchronously in the template
  $: featureTags =
    synth.featureTags && synth.featureTags.length > 0
      ? synth.featureTags
      : [`${synth.keysCount} клавиш`, synth.synthEngine, synth.formFactor];
  $: stars = '★'.repeat(synth.popularity?.stars ?? 0) + '☆'.repeat(5 - (synth.popularity?.stars ?? 0));
</script>

<svelte:head>
  <title>{synth.modelName} - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="detail-page">
  <header class="model-header">
    <h1>{synth.brand} {synth.modelName}</h1>
    <p class="series">{synth.series} • {synth.year}</p>
    <div class="feature-tags">
      {#each featureTags as tag}
        <span class="feature-tag">{tag}</span>
      {/each}
    </div>
    {#if synth.isGem}<span class="gem-badge">⭐ ГЕМ коллекции</span>{/if}
  </header>

  <section class="hero-media">
    <div class="hero-image-wrap">
      <img 
        src={cachedImageUrl || (synth.images && synth.images[0] ? synth.images[0] : '')} 
        alt={synth.modelName} 
        loading="lazy" 
        decoding="async"
        on:error={(e) => { e.target.style.display = 'none'; }}
      />
      <span class="badge badge-price">{releasePrice ? `$${releasePrice}` : 'н/д'}</span>
      <span class="badge badge-year">{synth.year}</span>
    </div>
    <p class="inflation-line">
      {#if releasePrice}
        {#await calculateInflation(releasePrice, synth.year)}
          C поправкой на инфляцию: ...
        {:then inflation}
          C поправкой на инфляцию: {formatUSD(inflation.adjustedUSD)} • {formatUAH(inflation.convertedUAH)}
        {:catch}
          C поправкой на инфляцию: н/д • н/д
        {/await}
      {:else}
        C поправкой на инфляцию: н/д • н/д
      {/if}
    </p>
  </section>

  <section class="gallery-section">
    <ImageGallery images={synth.images} />
  </section>

  <section class="specs-section">
    <h2>Характеристики</h2>
    <div class="specs-grid">
      <div class="spec-item">
        <span class="label">Бренд</span>
        <span class="value">{synth.brand}</span>
      </div>
      <div class="spec-item">
        <span class="label">Серия</span>
        <span class="value">{synth.series}</span>
      </div>
      <div class="spec-item">
        <span class="label">Год выпуска</span>
        <span class="value">{synth.year}</span>
      </div>
      <div class="spec-item">
        <span class="label">Форм‑фактор</span>
        <span class="value">{synth.formFactor}</span>
      </div>
      <div class="spec-item">
        <span class="label">Количество клавиш</span>
        <span class="value">{synth.keysCount}</span>
      </div>
      <div class="spec-item">
        <span class="label">Тип синтеза</span>
        <span class="value">{synth.synthEngine}</span>
      </div>
      {#if synth.dimensions}
        <div class="spec-item">
          <span class="label">Габариты</span>
          <span class="value">{synth.dimensions}</span>
        </div>
      {/if}
      {#if synth.polyphony}
        <div class="spec-item">
          <span class="label">Полифония</span>
          <span class="value">{synth.polyphony} нот</span>
        </div>
      {/if}
      {#if synth.midi !== undefined}
        <div class="spec-item">
          <span class="label">MIDI</span>
          <span class="value">{synth.midi ? 'Да' : 'Нет'}</span>
        </div>
      {/if}
      {#if synth.sequencer !== undefined}
        <div class="spec-item">
          <span class="label">Секвенсор</span>
          <span class="value">{synth.sequencer ? 'Да' : 'Нет'}</span>
        </div>
      {/if}
      {#if synth.autoAccompaniment !== undefined}
        <div class="spec-item">
          <span class="label">Автоаккомпанемент</span>
          <span class="value">{synth.autoAccompaniment ? 'Да' : 'Нет'}</span>
        </div>
      {/if}
      {#if synth.power}
        <div class="spec-item">
          <span class="label">Питание</span>
          <span class="value">{synth.power}</span>
        </div>
      {/if}
    </div>
  </section>

  <section class="description-section">
    <h2>Описание</h2>
    <p>{synth.description}</p>
  </section>

  <section class="market-section">
    <h2>Рынок и ценность</h2>
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
  </section>

  <section class="similar-section">
    <h2>Похожие модели</h2>
    <!-- Здесь можно добавить компонент с похожими моделями -->
    <p>Скоро будет добавлен блок похожих моделей.</p>
  </section>
</main>

<style>
  .detail-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 1rem;
  }
  .model-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .model-header h1 {
    margin: 0;
    font-size: 2rem;
  }
  .series {
    color: #888;
    margin-top: 0.5rem;
  }
  .gem-badge {
    display: inline-block;
    background: #ffd700;
    color: #333;
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-weight: bold;
    margin-top: 0.5rem;
  }
  .gallery-section {
    margin-bottom: 2rem;
  }
  .feature-tags {
    margin-top: 0.8rem;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.4rem;
  }
  .feature-tag {
    border: 1px solid rgba(80, 220, 220, 0.45);
    color: #8ce2ff;
    border-radius: 999px;
    padding: 0.15rem 0.5rem;
    font-size: 0.75rem;
  }
  .hero-media {
    margin-bottom: 1.4rem;
  }
  .hero-image-wrap {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
  }
  .hero-image-wrap img {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    display: block;
  }
  .badge {
    position: absolute;
    top: 12px;
    padding: 0.25rem 0.6rem;
    border-radius: 8px;
    color: #fff;
    font-weight: 700;
  }
  .badge-price {
    left: 12px;
    background: #ff5459;
  }
  .badge-year {
    right: 12px;
    background: #32b8c6;
  }
  .inflation-line {
    margin: 0.5rem 0 0;
    color: #a5c2d4;
    font-size: 0.9rem;
  }
  .specs-section h2, .description-section h2, .similar-section h2, .market-section h2 {
    border-bottom: 1px solid rgba(255,255,255,0.1);
    padding-bottom: 0.5rem;
    margin-bottom: 1rem;
  }
  .specs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  .spec-item {
    background: rgba(0,0,0,0.2);
    padding: 0.8rem;
    border-radius: 6px;
  }
  .spec-item .label {
    display: block;
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 0.3rem;
  }
  .spec-item .value {
    font-weight: bold;
  }
  .description-section p {
    line-height: 1.6;
  }
  .market-section {
    margin-top: 1.5rem;
  }
  .market-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
  }
  .market-item {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
    padding: 0.75rem;
  }
  .market-item .label {
    display: block;
    color: #95a7b7;
    font-size: 0.8rem;
  }
  .market-item .value {
    display: block;
    margin-top: 0.15rem;
    font-size: 1rem;
    font-weight: 700;
  }
  .popularity {
    margin-top: 0.9rem;
    background: rgba(50, 184, 198, 0.16);
    border-left: 4px solid #32b8c6;
    padding: 0.65rem 0.8rem;
    border-radius: 7px;
  }
  .pop-label {
    font-size: 0.72rem;
    text-transform: uppercase;
    color: #99b4c4;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .pop-stars {
    margin-top: 0.2rem;
    color: #ffd04f;
    letter-spacing: 1px;
  }
  .pop-status {
    margin-top: 0.2rem;
    color: #79e4ed;
    font-weight: 700;
  }
</style>
