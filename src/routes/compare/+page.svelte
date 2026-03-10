<script lang="ts">
  import { synths } from '$lib/data/synths';
  
  // Фильтруем модели Casio SA series
  const casioSA = synths.filter(s => s.brand === 'Casio' && s.series.includes('SA Series'));
  
  // Сортировка по году
  let sortKey = 'year';
  let sortDir = 'asc';
  
  function sortTable(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }
  
  $: sorted = [...casioSA].sort((a, b) => {
    const valA = a[sortKey as keyof typeof a];
    const valB = b[sortKey as keyof typeof b];
    if (valA === undefined || valB === undefined) return 0;
    const mult = sortDir === 'asc' ? 1 : -1;
    if (typeof valA === 'number' && typeof valB === 'number') {
      return (valA - valB) * mult;
    }
    return String(valA).localeCompare(String(valB)) * mult;
  });
</script>

<svelte:head>
  <title>Сравнение моделей Casio SA - Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<main class="compare-page">
  <h1>Сравнение моделей Casio SA Series</h1>
  <p>Таблица сравнения основных характеристик моделей Casio SA Series.</p>

  <table>
    <thead>
      <tr>
        <th on:click={() => sortTable('modelName')}>Модель {sortKey==='modelName' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => sortTable('year')}>Год {sortKey==='year' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
        <th on:click={() => sortTable('keysCount')}>Клавиш {sortKey==='keysCount' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
        <th>Синтез</th>
        <th>Форм‑фактор</th>
        <th>Особенности</th>
      </tr>
    </thead>
    <tbody>
      {#each sorted as synth}
        <tr>
          <td><a href="/synths/{synth.brand}/{synth.series}/{synth.modelName}">{synth.modelName}</a></td>
          <td>{synth.year}</td>
          <td>{synth.keysCount}</td>
          <td>{synth.synthEngine}</td>
          <td>{synth.formFactor}</td>
          <td>{synth.description.slice(0, 100)}...</td>
        </tr>
      {/each}
    </tbody>
  </table>

  {#if casioSA.length === 0}
    <p>Нет моделей Casio SA Series в каталоге.</p>
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
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  th, td {
    border: 1px solid rgba(255,255,255,0.1);
    padding: 0.5rem;
    text-align: left;
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