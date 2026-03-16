<script lang="ts">
  import ImageGallery from '$lib/components/ImageGallery.svelte';
  import { calculateInflation, formatUAH, formatUSD } from '$lib/utils/economy';
  import { onMount } from 'svelte';
  import SynthEditor from '$lib/components/SynthEditor.svelte';
  
  export let data: { synth: import('$lib/data/synths').SynthModel };
  $: synth = data.synth;
  $: releasePrice = synth.releasePriceUSD ?? null;
  
  let cachedImageUrl: string | null = null;
  let showEditor = $state(false);
  let editedSynth = $state<typeof synth | null>(null);

  onMount(() => {
    if (synth.images && synth.images.length > 0) {
      cacheImage(synth.images[0]);
    }
  });

  async function cacheImage(imageUrl: string) {
    try {
      const response = await fetch(`/api/cache-image?url=${encodeURIComponent(imageUrl)}`);
      const result = await response.json();
      if (result.url) {
        cachedImageUrl = result.url;
      }
    } catch (error) {
      console.error('Error caching image:', error);
      cachedImageUrl = imageUrl;
    }
  }
  
  function openEditor() {
    editedSynth = JSON.parse(JSON.stringify(synth));
    showEditor = true;
  }
  
  function closeEditor() {
    showEditor = false;
    editedSynth = null;
  }
  
  async function saveChanges() {
    if (!editedSynth) return;
    
    try {
      const response = await fetch('/api/synths/' + synth.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedSynth)
      });
      
      if (response.ok) {
        const updated = await response.json();
        // Update local data
        Object.assign(synth, updated);
        showEditor = false;
        alert('Сохранено!');
      } else {
        alert('Ошибка сохранения');
      }
    } catch (e) {
      console.error('Error saving:', e);
      alert('Ошибка сохранения');
    }
  }

  let featureTags =
    synth.featureTags && synth.featureTags.length > 0
      ? synth.featureTags
      : [`${synth.keysCount} клавиш`, synth.synthEngine, synth.formFactor];
  let stars = '★'.repeat(synth.popularity?.stars ?? 0) + '☆'.repeat(5 - (synth.popularity?.stars ?? 0));
</script>

<svelte:head>
  <title>{synth.modelName} - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="detail-page">
  <header class="model-header">
    <div class="header-top">
      <div>
        <h1>{synth.brand} {synth.modelName}</h1>
        <p class="series">{synth.series} • {synth.year}</p>
      </div>
      <button class="edit-btn" onclick={openEditor}>✏️ Редактировать</button>
    </div>
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
        <span class="label">Тип</span>
        <span class="value">{synth.formFactor}</span>
      </div>
      <div class="spec-item">
        <span class="label">Клавиши</span>
        <span class="value">{synth.keysCount}</span>
      </div>
      <div class="spec-item">
        <span class="label">Звуковой движок</span>
        <span class="value">{synth.synthEngine}</span>
      </div>
      {#if synth.dimensions}
        <div class="spec-item">
          <span class="label">Размеры</span>
          <span class="value">{synth.dimensions}</span>
        </div>
      {/if}
      {#if synth.polyphony}
        <div class="spec-item">
          <span class="label">Полифония</span>
          <span class="value">{synth.polyphony} голосов</span>
        </div>
      {/if}
      {#if synth.midi}
        <div class="spec-item">
          <span class="label">MIDI</span>
          <span class="value">✅</span>
        </div>
      {/if}
      {#if synth.sequencer}
        <div class="spec-item">
          <span class="label">Секвенсер</span>
          <span class="value">✅</span>
        </div>
      {/if}
      {#if synth.autoAccompaniment}
        <div class="spec-item">
          <span class="label">Автоаккомпанемент</span>
          <span class="value">✅</span>
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

  {#if synth.marketPrices}
    <section class="market-section">
      <h2>Цены на вторичном рынке</h2>
      <div class="market-grid">
        {#if synth.marketPrices.usaUsed}
          <div class="market-card">
            <span class="flag">🇺🇸</span>
            <span class="label">США б/у</span>
            <span class="price">{synth.marketPrices.usaUsed}</span>
          </div>
        {/if}
        {#if synth.marketPrices.uaUsed}
          <div class="market-card">
            <span class="flag">🇺🇦</span>
            <span class="label">Украина б/у</span>
            <span class="price">{synth.marketPrices.uaUsed}</span>
          </div>
        {/if}
        {#if synth.marketPrices.olxLowest}
          <div class="market-card">
            <span class="flag">🔎</span>
            <span class="label">OLX находка</span>
            <span class="price">{synth.marketPrices.olxLowest}</span>
          </div>
        {/if}
        {#if synth.marketPrices.coolDeal}
          <div class="market-card">
            <span class="flag">🎯</span>
            <span class="label">Крутая покупка</span>
            <span class="price">{synth.marketPrices.coolDeal}</span>
          </div>
        {/if}
      </div>
    </section>
  {/if}

  {#if synth.popularity}
    <section class="popularity-section">
      <h2>Популярность</h2>
      <div class="popularity-card">
        <div class="stars">{stars}</div>
        <div class="status">{synth.popularity.status}</div>
      </div>
    </section>
  {/if}
</main>

{#if showEditor && editedSynth}
  <SynthEditor 
    synth={editedSynth} 
    onSave={saveChanges}
    onCancel={closeEditor}
  />
{/if}

<style>
  .detail-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 15px;
  }
  .edit-btn {
    background: #0f3460;
    color: #fff;
    border: 1px solid #00d9ff;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
  }
  .edit-btn:hover {
    background: #00d9ff;
    color: #000;
  }
  h1 {
    color: #00d9ff;
    margin: 0;
    font-size: 2rem;
  }
  .series {
    color: #888;
    margin: 5px 0 0;
  }
  .model-header {
    margin-bottom: 30px;
  }
  .feature-tags {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 15px;
  }
  .feature-tag {
    background: rgba(0, 217, 255, 0.1);
    border: 1px solid rgba(0, 217, 255, 0.3);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 13px;
    color: #00d9ff;
  }
  .gem-badge {
    display: inline-block;
    background: linear-gradient(135deg, #f39c12, #e67e22);
    color: #000;
    padding: 5px 15px;
    border-radius: 20px;
    font-weight: 600;
    margin-top: 10px;
  }
  .hero-media {
    margin-bottom: 30px;
  }
  .hero-image-wrap {
    position: relative;
    background: #16213e;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 15px;
  }
  .hero-image-wrap img {
    width: 100%;
    max-height: 500px;
    object-fit: contain;
    display: block;
  }
  .badge {
    position: absolute;
    padding: 5px 12px;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1rem;
  }
  .badge-price {
    right: 15px;
    top: 15px;
    background: #ff5459;
    color: #fff;
  }
  .badge-year {
    right: 15px;
    top: 55px;
    background: #32b8c6;
    color: #fff;
  }
  .inflation-line {
    text-align: center;
    color: #888;
    font-size: 1.1rem;
  }
  .specs-section, .description-section, .market-section, .popularity-section {
    margin-bottom: 40px;
  }
  h2 {
    color: #00d9ff;
    border-bottom: 1px solid rgba(0, 217, 255, 0.2);
    padding-bottom: 10px;
    margin-bottom: 20px;
  }
  .specs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  .spec-item {
    background: #16213e;
    padding: 15px;
    border-radius: 8px;
  }
  .spec-item .label {
    display: block;
    color: #888;
    font-size: 12px;
    text-transform: uppercase;
    margin-bottom: 5px;
  }
  .spec-item .value {
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
  }
  .description-section p {
    color: #ccc;
    line-height: 1.6;
  }
  .market-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 15px;
  }
  .market-card {
    background: #16213e;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
  }
  .market-card .flag {
    font-size: 24px;
    display: block;
    margin-bottom: 8px;
  }
  .market-card .label {
    display: block;
    color: #888;
    font-size: 12px;
    margin-bottom: 5px;
  }
  .market-card .price {
    color: #00d9ff;
    font-size: 1.1rem;
    font-weight: 700;
  }
  .popularity-card {
    background: #16213e;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
  }
  .popularity-card .stars {
    color: #ffd04f;
    font-size: 2rem;
    letter-spacing: 5px;
  }
  .popularity-card .status {
    color: #00d9ff;
    margin-top: 10px;
    font-size: 1.2rem;
  }
</style>
