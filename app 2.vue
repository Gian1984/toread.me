<script setup lang="ts">
const mode = ref<'day' | 'night'>('day')
const warmth = ref(42)

const readerStyle = computed(() => {
  if (mode.value === 'night') {
    return {
      backgroundColor: '#000000',
      color: '#ffffff',
    }
  }

  const mix = warmth.value / 100
  const start = [255, 255, 255]
  const end = [246, 232, 198]
  const rgb = start.map((channel, index) =>
    Math.round(channel + (end[index] - channel) * mix),
  )

  return {
    backgroundColor: `rgb(${rgb.join(', ')})`,
    color: '#21133f',
  }
})

const modeLabel = computed(() => (mode.value === 'day' ? 'Day' : 'Night'))
</script>

<template>
  <div
    class="min-h-screen bg-[#f6f8fb] text-ink transition-colors duration-300"
    :class="{ 'bg-[#09090b] text-white': mode === 'night' }"
  >
    <header
      class="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur"
      :class="{ 'border-white/10 bg-black/80': mode === 'night' }"
    >
      <div class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" class="flex items-center gap-3">
          <img
            src="/images/toread-logo.webp"
            width="52"
            height="52"
            alt="toread.me"
            class="h-[52px] w-[52px] rounded-full shadow-soft"
          >
          <span class="text-xl font-black tracking-normal">toread.me</span>
        </a>

        <nav class="hidden items-center gap-2 text-sm font-semibold text-slate-600 md:flex">
          <a class="rounded-md px-3 py-2 hover:bg-slate-100" href="#reader">Reader</a>
          <a class="rounded-md px-3 py-2 hover:bg-slate-100" href="#library">Library</a>
          <a class="rounded-md px-3 py-2 hover:bg-slate-100" href="#formats">Formats</a>
        </nav>
      </div>
    </header>

    <main class="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside
        class="rounded-lg border border-black/10 bg-white p-4 shadow-soft lg:sticky lg:top-24 lg:h-[calc(100vh-7rem)]"
        :class="{ 'border-white/10 bg-zinc-950': mode === 'night' }"
      >
        <div class="flex items-center gap-3 border-b border-black/10 pb-4" :class="{ 'border-white/10': mode === 'night' }">
          <img src="/images/toread-logo.webp" alt="" class="h-12 w-12 rounded-full">
          <div>
            <p class="text-sm font-black uppercase text-flame">Ebook reader</p>
            <h1 class="text-2xl font-black leading-none">Coming soon</h1>
          </div>
        </div>

        <div class="mt-5 space-y-5">
          <section>
            <p class="mb-2 text-xs font-black uppercase text-slate-500">Theme</p>
            <div class="grid grid-cols-2 overflow-hidden rounded-lg border border-black/10 text-sm font-bold" :class="{ 'border-white/10': mode === 'night' }">
              <button
                class="px-3 py-2 transition"
                :class="mode === 'day' ? 'bg-sun text-ink' : 'bg-transparent'"
                type="button"
                @click="mode = 'day'"
              >
                Day
              </button>
              <button
                class="px-3 py-2 transition"
                :class="mode === 'night' ? 'bg-violet text-white' : 'bg-transparent'"
                type="button"
                @click="mode = 'night'"
              >
                Night
              </button>
            </div>
          </section>

          <section>
            <label for="warmth" class="mb-2 block text-xs font-black uppercase text-slate-500">
              Paper tone
            </label>
            <input
              id="warmth"
              v-model="warmth"
              :disabled="mode === 'night'"
              type="range"
              min="0"
              max="100"
              class="w-full accent-violet disabled:opacity-40"
            >
            <div class="mt-2 flex justify-between text-xs font-semibold text-slate-500">
              <span>White</span>
              <span>Beige</span>
            </div>
          </section>

          <section class="rounded-lg bg-slate-100 p-4 text-sm leading-6" :class="{ 'bg-zinc-900 text-zinc-200': mode === 'night' }">
            <p class="font-bold">Next core feature</p>
            <p class="mt-1 text-slate-600" :class="{ 'text-zinc-400': mode === 'night' }">
              Local ebook import, private library, reading progress, bookmarks, and typography controls.
            </p>
          </section>
        </div>
      </aside>

      <section class="space-y-6">
        <div
          class="overflow-hidden rounded-lg border border-black/10 bg-white shadow-soft"
          :class="{ 'border-white/10 bg-zinc-950': mode === 'night' }"
        >
          <div class="grid min-h-[520px] lg:grid-cols-[minmax(0,1fr)_320px]">
            <article id="reader" class="p-5 sm:p-8">
              <div
                class="mx-auto min-h-[460px] max-w-3xl rounded-lg border border-black/10 p-7 shadow-sm transition-colors sm:p-10"
                :style="readerStyle"
                :class="{ 'border-white/15': mode === 'night' }"
              >
                <p class="text-sm font-black uppercase text-flame">Reader preview</p>
                <h2 class="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                  Your reading space, tuned for focus.
                </h2>
                <div class="prose prose-lg mt-8 max-w-none font-reader" :class="{ 'prose-invert': mode === 'night' }">
                  <p>
                    toread.me is becoming a private ebook reader for saving books,
                    opening them quickly, and returning to the exact point where you left off.
                  </p>
                  <p>
                    The interface starts with simple controls: a clean day mode with adjustable
                    paper warmth, and a true night mode with black pages and white text.
                  </p>
                  <p>
                    The next step is the local library: import, metadata, reading progress,
                    bookmarks, and ergonomic typography settings.
                  </p>
                </div>
              </div>
            </article>

            <div
              class="border-t border-black/10 bg-slate-50 p-5 sm:p-6 lg:border-l lg:border-t-0"
              :class="{ 'border-white/10 bg-zinc-900': mode === 'night' }"
            >
              <p class="text-xs font-black uppercase text-slate-500">Status</p>
              <h3 class="mt-2 text-2xl font-black">Reader shell</h3>

              <dl class="mt-6 space-y-4">
                <div class="rounded-lg bg-white p-4" :class="{ 'bg-black': mode === 'night' }">
                  <dt class="text-xs font-black uppercase text-slate-500">Mode</dt>
                  <dd class="mt-1 text-lg font-black">{{ modeLabel }}</dd>
                </div>
                <div class="rounded-lg bg-white p-4" :class="{ 'bg-black': mode === 'night' }">
                  <dt class="text-xs font-black uppercase text-slate-500">Paper tone</dt>
                  <dd class="mt-1 text-lg font-black">{{ mode === 'day' ? `${warmth}% warm` : 'Disabled in night mode' }}</dd>
                </div>
                <div class="rounded-lg bg-white p-4" :class="{ 'bg-black': mode === 'night' }">
                  <dt class="text-xs font-black uppercase text-slate-500">Privacy</dt>
                  <dd class="mt-1 text-lg font-black">Client-side first</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div id="library" class="grid gap-4 md:grid-cols-3">
          <article class="rounded-lg border border-black/10 bg-white p-5 shadow-soft" :class="{ 'border-white/10 bg-zinc-950': mode === 'night' }">
            <p class="text-xs font-black uppercase text-flame">Library</p>
            <h3 class="mt-2 text-xl font-black">Personal shelf</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600" :class="{ 'text-zinc-400': mode === 'night' }">
              A compact view for imported books, recent reads, and saved progress.
            </p>
          </article>
          <article class="rounded-lg border border-black/10 bg-white p-5 shadow-soft" :class="{ 'border-white/10 bg-zinc-950': mode === 'night' }">
            <p class="text-xs font-black uppercase text-flame">Reading</p>
            <h3 class="mt-2 text-xl font-black">Typography controls</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600" :class="{ 'text-zinc-400': mode === 'night' }">
              Font size, line height, page width, bookmarks, and last-position restore.
            </p>
          </article>
          <article id="formats" class="rounded-lg border border-black/10 bg-white p-5 shadow-soft" :class="{ 'border-white/10 bg-zinc-950': mode === 'night' }">
            <p class="text-xs font-black uppercase text-flame">Formats</p>
            <h3 class="mt-2 text-xl font-black">EPUB first</h3>
            <p class="mt-3 text-sm leading-6 text-slate-600" :class="{ 'text-zinc-400': mode === 'night' }">
              Start with browser-friendly ebook parsing before expanding to heavier formats.
            </p>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>
