<script lang="ts">
  import { synths, type SynthModel } from '$lib/data/synths';

  type SortField =
    | 'modelName'
    | 'brand'
    | 'series'
    | 'year'
    | 'keysCount'
    | 'formFactor'
    | 'releasePriceUSD'
    | 'popularityStars';

  const allBrands = Array.from(new Set(synths.map((s) => s.brand))).sort();
  const allSeries = Array.from(new Set(synths.map((s) => s.series))).sort();

  let selectedBrand = 'all';
  let selectedSeries = 'all';
  let query = '';
  let limit = 20;
  let sortField: SortField = 'year';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function cycleSort(field: SortField) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    sortField = field;
    sortDirection = 'asc';
  }

  function compareValues(a: SynthModel, b: SynthModel) {
    const direction = sortDirection === 'asc' ? 1 : -1;

    if (sortField === 'popularityStars') {
      const va = a.popularity?.stars ?? 0;
      const vb = b.popularity?.stars ?? 0;
      return (va - vb) * direction;
    }

    const va = a[sortField];
    const vb = b[sortField];

    if (typeof va === 'number' && typeof vb === 'number') {
      return (va - vb) * direction;
    }

    return String(va).localeCompare(String(vb), 'ru') * direction;
  }

  $: filtered = synths.filter((s) => {
    if (selectedBrand !== 'all' && s.brand !== selectedBrand) return false;
    if (selectedSeries !== 'all' && s.series !== selectedSeries) return false;

    if (query.trim()) {
      const q = query.toLowerCase();
      const text = `${s.brand} ${s.series} ${s.modelName} ${s.description}`.toLowerCase();
      if (!text.includes(q)) return false;
    }

    return true;
  });

  $: sorted = [...filtered].sort(compareValues).slice(0, limit);

</script>

<svelte:head>
  <title>Сравнение моделей - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="compare-page">
  <h1>Сравнение моделей</h1>
  <p>Сортируемая таблица по всем моделям каталога с фильтрами по бренду, серии и поиску.</p>

  <section class="controls">
    <label>
      Бренд
      <select bind:value={selectedBrand}>
        <option value="all">Все</option>
        {#each allBrands as brand}
          <option value={brand}>{brand}</option>
        {/each}
      </select>
    </label>

    <label>
      Серия
      <select bind:value={selectedSeries}>
        <option value="all">Все</option>
        {#each allSeries as series}
          <option value={series}>{series}</option>
        {/each}
      </select>
    </label>

    <label>
      Поиск
      <input type="text" bind:value={query} placeholder="Например, PSS, Reface, SHS" />
    </label>

    <label>
      Показать
      <select bind:value={limit}>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
        <option value={100}>100</option>
      </select>
    </label>
  </section>

  <table>
    <thead>
      <tr>
        <th on:click={() => cycleSort('modelName')}>Модель {sortField==='modelName' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('brand')}>Бренд {sortField==='brand' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('series')}>Серия {sortField==='series' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('year')}>Год {sortField==='year' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('keysCount')}>Клавиш {sortField==='keysCount' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('formFactor')}>Форм‑фактор {sortField==='formFactor' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => cycleSort('releasePriceUSD')}>Цена старта {sortField==='releasePriceUSD' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
        <th>Рынок б/у</th>
        <th on:click={() => cycleSort('popularityStars')}>Популярность {sortField==='popularityStars' ? (sortDirection==='asc' ? '▲' : '▼') : ''}</th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as synth}
        <tr>
          <td><a href="/synths/{synth.brand}/{synth.series}/{synth.modelName}">{synth.modelName}</a></td>
          <td>{synth.brand}</td>
          <td>{synth.series}</td>
          <td>{synth.year}</td>
          <td>{synth.keysCount}</td>
          <td>{synth.formFactor}</td>
          <td>{synth.releasePriceUSD ? `$${synth.releasePriceUSD}` : 'н/д'}</td>
          <td>
            <div class="market-cell">
              <span>🇺🇸 {synth.marketPrices?.usaUsed ?? 'н/д'}</span>
              <span>🇺🇦 {synth.marketPrices?.uaUsed ?? 'н/д'}</span>
            </div>
          </td>
          <td>
            <div class="pop-cell">
              {'★'.repeat(synth.popularity?.stars ?? 0)}{'☆'.repeat(5 - (synth.popularity?.stars ?? 0))}
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if filtered.length === 0}
    <p>По текущим фильтрам ничего не найдено.</p>
  {/if}
</main>

<style>
  .compare-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  h1 {
    text-align: center;
  }
  .controls {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    margin-top: 1rem;
  }
  .controls label {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.9rem;
  }
  .controls input,
  .controls select {
    padding: 0.45rem 0.6rem;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.2);
    background: rgba(0,0,0,0.25);
    color: inherit;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
    overflow: auto;
    display: block;
  }
  th, td {
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.5rem;
    text-align: left;
  }
  .market-cell {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.82rem;
    min-width: 150px;
  }
  .pop-cell {
    color: #ffd04f;
    letter-spacing: 1px;
    white-space: nowrap;
  }
  th {
    background: rgba(0,0,0,0.3);
    cursor: pointer;
  }
  th:hover {
    background: rgba(0,0,0,0.5);
  }
  a {
    color: #4a90e2;
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
  }
</style>
