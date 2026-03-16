<script lang="ts">
  export let images: string[];
  let currentIndex = 0;
  const next = () => currentIndex = (currentIndex + 1) % images.length;
  const prev = () => currentIndex = (currentIndex - 1 + images.length) % images.length;
</script>

<div class="gallery">
  <img src={images[currentIndex]} alt="View {currentIndex + 1}" loading="lazy" decoding="async" />
  <button onclick={prev} aria-label="Previous image">◀</button>
  <button onclick={next} aria-label="Next image">▶</button>
  <div class="thumbs">
    {#each images as img, i}
      <button onclick={() => currentIndex = i} class:active={i===currentIndex} aria-label="View image {i+1}">
        <img src={img} alt="Thumb {i+1}" loading="lazy" decoding="async" />
      </button>
    {/each}
  </div>
</div>

<style>
  .gallery { position: relative; max-width: 600px; margin: 0 auto; }
  img { width: 100%; border-radius: 8px; }
  button { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: white; border: none; padding: 0.5rem; cursor: pointer; }
  button:first-of-type { left: 0; }
  button:last-of-type { right: 0; }
  .thumbs { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .thumbs button { position: static; transform: none; background: none; padding: 0; }
  .thumbs img { width: 80px; height: 60px; object-fit: cover; opacity: 0.6; }
  .thumbs button.active img { opacity: 1; border: 2px solid #fff; }
</style>