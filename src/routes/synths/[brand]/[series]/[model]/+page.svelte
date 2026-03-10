<script lang="ts">
  import ImageGallery from '$lib/components/ImageGallery.svelte';
  
  export let data: { synth: import('$lib/data/synths').SynthModel };
  $: synth = data.synth;
</script>

<svelte:head>
  <title>{synth.modelName} - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="detail-page">
  <header class="model-header">
    <h1>{synth.brand} {synth.modelName}</h1>
    <p class="series">{synth.series} • {synth.year}</p>
    {#if synth.isGem}<span class="gem-badge">⭐ ГЕМ коллекции</span>{/if}
  </header>

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
  .specs-section h2, .description-section h2, .similar-section h2 {
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
</style>