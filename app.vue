<template>
  <main class="app-shell">
    <section class="coming-soon" aria-labelledby="page-title">
      <div class="brand-mark" aria-label="to read me">
        <span>TO</span>
        <span>READ</span>
        <span>.ME</span>
      </div>

      <p class="eyebrow">toread.me</p>
      <h1 id="page-title">Coming soon</h1>
      <p class="summary">
        A focused place to save, organize, and return to what matters next.
      </p>
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 28px;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  color: #241447;
  background:
    radial-gradient(circle at 20% 20%, rgba(255, 214, 51, 0.24), transparent 34%),
    radial-gradient(circle at 82% 18%, rgba(255, 91, 51, 0.18), transparent 30%),
    #fffaf2;
}

.coming-soon {
  width: min(100%, 760px);
  text-align: center;
}

.brand-mark {
  width: min(68vw, 320px);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.02em;
  margin: 0 auto 36px;
  border: 22px solid #ffcf23;
  border-radius: 50%;
  box-shadow:
    0 0 0 14px #ff5a35,
    0 24px 70px rgba(73, 35, 150, 0.16);
  background: #ffffff;
  color: #7a31e6;
  font-size: clamp(2.15rem, 10vw, 4.25rem);
  font-weight: 950;
  line-height: 0.82;
  letter-spacing: 0;
}

.brand-mark span {
  display: block;
}

.eyebrow {
  margin: 0 0 14px;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #ff5a35;
}

h1 {
  margin: 0;
  font-size: clamp(3rem, 9vw, 6.5rem);
  line-height: 1;
  letter-spacing: 0;
}

.summary {
  max-width: 620px;
  margin: 24px auto 0;
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  line-height: 1.6;
  color: #5c4d76;
}

@media (max-width: 520px) {
  .brand-mark {
    border-width: 16px;
    box-shadow:
      0 0 0 10px #ff5a35,
      0 20px 54px rgba(73, 35, 150, 0.14);
  }
}
</style>
