<script lang="ts">
  import { onMount } from 'svelte';
  
  let { children } = $props();
  let darkMode = $state(true);
  
  onMount(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      darkMode = false;
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }
  });
  
  function toggleTheme() {
    darkMode = !darkMode;
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    document.body.classList.toggle('dark', darkMode);
  }
</script>

<svelte:head>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎹</text></svg>" />
  <title>Энциклопедия Винтажных Синтезаторов</title>
</svelte:head>

<div class="app">
  <header class="sticky-header">
    <div class="header-left">
      <a href="/" class="logo">🎹 Энциклопедия Винтажных Синтезаторов</a>
      <span class="version-badge">v3.0</span>
    </div>
    <nav class="nav-links">
      <a href="/">Каталог</a>
      <a href="/compare">Сравнение</a>
      <a href="/gems">Топ‑гемы</a>
    </nav>
    <div class="header-right">
      <button onclick={toggleTheme} class="theme-toggle">
        {darkMode ? '🌙' : '☀️'}
      </button>
    </div>
  </header>
  
  <div class="content">
    {@render children()}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
    color: #e0e0e0;
    min-height: 100vh;
    transition: background 0.3s, color 0.3s;
  }
  :global(body.light) {
    background: linear-gradient(135deg, #f5f7fa, #c3cfe2);
    color: #333;
  }
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .sticky-header {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  :global(body.light) .sticky-header {
    background: rgba(255,255,255,0.8);
    border-bottom: 1px solid rgba(0,0,0,0.1);
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .logo {
    font-weight: bold;
    font-size: 1.1rem;
    text-decoration: none;
    color: inherit;
  }
  .nav-links {
    display: flex;
    gap: 1rem;
  }
  .nav-links a {
    color: #aaa;
    text-decoration: none;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    transition: background 0.2s, color 0.2s;
  }
  .nav-links a:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }
  .version-badge {
    background: #4a90e2;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
  }
  .theme-toggle {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s;
  }
  .theme-toggle:hover {
    background: rgba(255,255,255,0.1);
  }
  .content {
    flex: 1;
  }
</style>