<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  Bars3Icon,
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cog6ToothIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { sampleBooks } from '~/data/sampleBooks'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const searchQuery = ref('')
const mode = ref<'day' | 'night'>('day')
const warmth = ref(38)
const fontSize = ref(19)
const isBoldText = ref(false)
const selectedTypeface = ref('serif')
const readerExpanded = ref(false)
const activeBook = sampleBooks[0]
const activeBookFile = ref(activeBook.file)
const activeBookTitle = ref(activeBook.title)
const activeBookAuthor = ref(activeBook.author)
const activeBookSource = ref(activeBook.source)
const importedBookUrl = ref<string | null>(null)
const isDraggingBook = ref(false)
const bookInputRef = ref<HTMLInputElement | null>(null)

const typefaces = [
  {
    label: 'Serif',
    value: 'serif',
    stack: 'Georgia, Cambria, "Times New Roman", serif',
  },
  {
    label: 'System',
    value: 'system',
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  {
    label: 'Readable Sans',
    value: 'readable-sans',
    stack: '"Helvetica Neue", Arial, sans-serif',
  },
  {
    label: 'Mono',
    value: 'mono',
    stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
]

const libraryItems = [
  { title: 'Imported books', description: 'Keep local EPUB files ready for focused reading.', icon: BookOpenIcon },
  { title: 'Bookmarks', description: 'Save passages and return to important pages faster.', icon: DocumentArrowUpIcon },
  { title: 'Reader settings', description: 'Tune theme, paper tone, typeface, and reading size.', icon: Cog6ToothIcon },
]

const navItems = [
  { label: 'Reader', href: '#reader', active: true },
  { label: 'Library', href: '#library', active: false },
  { label: 'Settings', href: '#settings', active: false },
]

const searchResults = computed(() => {
  const items = ['Reader', 'Personal library', 'Day mode', 'Night mode', 'Paper tone']
  if (!searchQuery.value.trim()) return []

  return items.filter((item) =>
    item.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

const readerStyle = computed(() => {
  const currentTypeface = typefaces.find((typeface) => typeface.value === selectedTypeface.value)
  const baseStyle = {
    fontFamily: currentTypeface?.stack ?? typefaces[0].stack,
    fontWeight: isBoldText.value ? '700' : '400',
  }

  if (mode.value === 'night') {
    return {
      ...baseStyle,
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
    ...baseStyle,
    backgroundColor: `rgb(${rgb.join(', ')})`,
    color: '#111827',
  }
})

const readerShellClass = computed(() => [
  'rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl',
  readerExpanded.value
    ? 'fixed inset-0 z-[70] overflow-y-auto rounded-none border-0 bg-gray-950 p-4 sm:p-6'
    : '',
])

const readerTextStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: '1.75',
  fontFamily: readerStyle.value.fontFamily,
  fontWeight: readerStyle.value.fontWeight,
}))

const readerControlClass = computed(() => [
  'text-current transition-colors hover:text-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
  mode.value === 'night' ? 'text-white hover:text-indigo-300' : 'text-gray-800 hover:text-indigo-600',
])

const openSidebar = () => {
  sidebarOpen.value = true
}

const closeSidebar = () => {
  sidebarOpen.value = false
}

const setImportedBook = (file: File) => {
  if (!file.name.toLowerCase().endsWith('.epub')) return

  if (importedBookUrl.value) {
    URL.revokeObjectURL(importedBookUrl.value)
  }

  const url = URL.createObjectURL(file)
  importedBookUrl.value = url
  activeBookFile.value = url
  activeBookTitle.value = file.name.replace(/\.epub$/i, '')
  activeBookAuthor.value = 'Local import'
  activeBookSource.value = 'Your device'
  isDraggingBook.value = false
}

const handleBookInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) setImportedBook(file)
}

const handleBookDrop = (event: DragEvent) => {
  event.preventDefault()
  const file = event.dataTransfer?.files?.[0]
  if (file) setImportedBook(file)
}

onBeforeUnmount(() => {
  if (importedBookUrl.value) {
    URL.revokeObjectURL(importedBookUrl.value)
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <header class="sticky top-0 z-40 bg-gray-900 shadow-sm">
      <div class="flex h-16 w-full items-center gap-3 px-3 sm:px-4 lg:px-8">
        <button
          type="button"
          class="rounded-md p-2 text-gray-200 hover:bg-gray-800 hover:text-white lg:hidden"
          aria-label="Open sidebar"
          @click="openSidebar"
        >
          <Bars3Icon class="size-6" aria-hidden="true" />
        </button>

        <a href="/" class="flex shrink-0 items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
          <img
            src="/images/toread-logo.webp"
            width="34"
            height="34"
            alt="toread.me"
            class="h-8 w-8 rounded-full"
          >
          <span class="hidden text-base font-bold text-white sm:inline">toread.me</span>
        </a>

        <nav class="hidden items-center gap-1 lg:flex">
          <a
            v-for="item in navItems"
            :key="item.label"
            :href="item.href"
            class="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            :class="item.active ? 'bg-indigo-600 text-white' : 'text-gray-200 hover:bg-gray-800 hover:text-white'"
          >
            {{ item.label }}
          </a>
        </nav>

        <div class="ml-auto flex flex-1 justify-end" role="search">
          <div class="relative w-full max-w-md">
            <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              v-model="searchQuery"
              type="search"
              autocomplete="off"
              spellcheck="false"
              class="block w-full rounded-md border-2 border-gray-700 bg-gray-800 py-1.5 pl-10 pr-3 text-sm text-white outline-none transition-colors placeholder:text-gray-400 focus:border-transparent focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-indigo-400"
              placeholder="Search library, notes, books..."
            >
            <ul
              v-if="searchResults.length"
              class="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-700 bg-gray-900 text-sm text-gray-100 shadow-lg"
            >
              <li
                v-for="result in searchResults"
                :key="result"
                class="cursor-pointer px-4 py-2 hover:bg-gray-800"
              >
                {{ result }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
      @click="closeSidebar"
    />

    <aside
      class="fixed bottom-0 top-16 z-50 flex flex-col bg-gray-900 transition-all duration-200 lg:left-0"
      :class="[
        sidebarOpen ? 'left-0 w-72' : '-left-72 w-72 lg:left-0',
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
      ]"
    >
      <button
        type="button"
        class="absolute bottom-5 hidden rounded-md bg-gray-800 p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white lg:block"
        :class="sidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'right-5'"
        :aria-label="sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <ChevronRightIcon v-if="sidebarCollapsed" class="size-5" aria-hidden="true" />
        <ChevronLeftIcon v-else class="size-5" aria-hidden="true" />
      </button>

      <button
        v-if="sidebarOpen"
        type="button"
        class="absolute left-full top-4 ml-3 rounded-md p-2 text-white lg:hidden"
        aria-label="Close sidebar"
        @click="closeSidebar"
      >
        <XMarkIcon class="size-6" aria-hidden="true" />
      </button>

      <div
        v-if="!sidebarCollapsed"
        class="flex h-16 shrink-0 items-center px-5"
      >
        <div>
          <p class="text-sm font-bold text-white">Reader Workspace</p>
          <p class="text-xs text-gray-400">Private ebook tools</p>
        </div>
      </div>

      <div v-if="!sidebarCollapsed" class="px-6 pb-3">
        <div class="relative">
          <input
            type="text"
            class="w-full rounded-md border-2 border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Filter reader tools..."
          >
          <kbd class="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-gray-600 bg-gray-700 px-2 py-1 text-xs text-gray-400">⌘K</kbd>
        </div>
      </div>

      <nav
        class="custom-scrollbar flex-1 overflow-y-auto pb-8"
        :class="sidebarCollapsed ? 'px-3 pt-5' : 'px-4'"
      >
        <p v-if="!sidebarCollapsed" class="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Ebook Reader
        </p>

        <ul class="space-y-2">
          <li>
            <a
              href="#reader"
              class="flex items-center gap-3 rounded-md bg-indigo-500/20 p-2 text-sm font-semibold text-indigo-300"
            >
              <BookOpenIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Reader</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 hover:text-white"
              @click="bookInputRef?.click()"
            >
              <DocumentArrowUpIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Drop EPUB</span>
            </button>
          </li>
          <li>
            <a
              href="#settings"
              class="flex items-center gap-3 rounded-md p-2 text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <Cog6ToothIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Reading settings</span>
            </a>
          </li>
        </ul>

        <div v-if="!sidebarCollapsed" class="mt-8 rounded-lg border border-white/10 bg-gray-800/70 p-4">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Mode</p>
          <div class="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-gray-700">
            <button
              type="button"
              class="flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold"
              :class="mode === 'day' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
              @click="mode = 'day'"
            >
              <SunIcon class="size-4" aria-hidden="true" />
              Day
            </button>
            <button
              type="button"
              class="flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold"
              :class="mode === 'night' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
              @click="mode = 'night'"
            >
              <MoonIcon class="size-4" aria-hidden="true" />
              Night
            </button>
          </div>
        </div>
      </nav>
    </aside>

    <main
      class="transition-all duration-200"
      :class="sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'"
    >
      <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div class="mb-6 rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800/80 p-4 shadow-xl">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-indigo-600">toread.me</p>
              <h1 class="mt-1 text-2xl font-bold tracking-normal text-white sm:text-3xl">
                Ebook reader dashboard
              </h1>
              <p class="mt-2 max-w-3xl text-sm leading-6 text-gray-300">
                Continue reading {{ activeBookTitle }} by {{ activeBookAuthor }}.
              </p>
            </div>
            <div class="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
              <div>
                <p class="text-xs font-semibold uppercase text-indigo-400">Current book</p>
                <p class="text-sm font-bold text-indigo-100">{{ activeBookTitle }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section id="reader" :class="readerShellClass">
            <div class="mb-4 flex flex-col gap-3 border-b border-gray-700 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-xl font-bold text-white">Reader</h2>
                <p class="text-sm text-gray-400">{{ activeBookTitle }} · {{ activeBookAuthor }}</p>
              </div>
            </div>

            <div
              id="library"
              class="mb-5 rounded-lg border border-dashed p-4 transition-colors"
              :class="isDraggingBook ? 'border-indigo-400 bg-indigo-500/20' : 'border-gray-700 bg-gray-800/40'"
              @dragenter.prevent="isDraggingBook = true"
              @dragover.prevent="isDraggingBook = true"
              @dragleave.prevent="isDraggingBook = false"
              @drop="handleBookDrop"
            >
              <input
                ref="bookInputRef"
                class="hidden"
                type="file"
                accept=".epub,application/epub+zip"
                @change="handleBookInput"
              >
              <button
                type="button"
                class="flex w-full items-center gap-3 text-left"
                @click="bookInputRef?.click()"
              >
                <DocumentArrowUpIcon class="size-8 shrink-0 text-indigo-300" aria-hidden="true" />
                <span>
                  <span class="block text-sm font-bold text-white">Drop an EPUB here or click to choose</span>
                  <span class="mt-1 block text-xs text-gray-400">Open an ebook locally in your browser.</span>
                </span>
              </button>
            </div>

            <ClientOnly>
              <EbookReader
                :key="activeBookFile"
                :file="activeBookFile"
                :mode="mode"
                :reader-style="readerStyle"
                :reader-text-style="readerTextStyle"
                :reader-expanded="readerExpanded"
                :control-class="readerControlClass"
                @toggle-expanded="readerExpanded = !readerExpanded"
              />
              <template #fallback>
                <article
                  class="relative mx-auto flex min-h-[540px] max-w-3xl items-center justify-center rounded-md border border-gray-700 p-8 text-sm font-semibold shadow-xl transition-colors sm:p-12"
                  :style="readerStyle"
                >
                  Loading ebook reader...
                </article>
              </template>
            </ClientOnly>
          </section>

          <aside id="settings" class="space-y-4">
            <section class="rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl">
              <h2 class="text-base font-bold text-white">Current book</h2>
              <div class="mt-4 rounded-md border border-gray-700 bg-gray-800/60 p-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ activeBook.format }} edition</p>
                <p class="mt-1 text-sm font-bold text-white">{{ activeBookTitle }}</p>
                <p class="mt-1 text-sm text-gray-400">{{ activeBookAuthor }} · {{ activeBookSource }}</p>
                <a
                  :href="activeBookFile"
                  class="mt-3 inline-flex text-sm font-semibold text-indigo-300 hover:text-indigo-200"
                >
                  Open source EPUB
                </a>
              </div>
            </section>

            <section class="rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl">
              <h2 class="text-base font-bold text-white">Reading settings</h2>
              <div class="mt-4 space-y-4">
                <div class="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Theme</p>
                  <p class="mt-1 text-sm font-bold text-white">{{ mode === 'day' ? 'Day mode' : 'Night mode' }}</p>
                </div>

                <div class="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                  <label for="warmth" class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Paper tone
                  </label>
                  <input
                    id="warmth"
                    v-model="warmth"
                    :disabled="mode === 'night'"
                    type="range"
                    min="0"
                    max="100"
                    class="mt-3 w-full accent-indigo-600 disabled:opacity-40"
                  >
                  <div class="mt-2 flex justify-between text-xs font-semibold text-gray-400">
                    <span>White</span>
                    <span>{{ mode === 'day' ? `${warmth}% warm` : 'Locked' }}</span>
                  </div>
                </div>

                <div class="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                  <label for="font-size" class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Font size
                  </label>
                  <input
                    id="font-size"
                    v-model="fontSize"
                    type="range"
                    min="15"
                    max="26"
                    class="mt-3 w-full accent-indigo-600"
                  >
                  <p class="mt-2 text-sm font-bold text-white">{{ fontSize }}px</p>
                </div>

                <div class="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                  <label for="typeface" class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Typeface
                  </label>
                  <select
                    id="typeface"
                    v-model="selectedTypeface"
                    class="mt-2 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option
                      v-for="typeface in typefaces"
                      :key="typeface.value"
                      :value="typeface.value"
                    >
                      {{ typeface.label }}
                    </option>
                  </select>
                </div>

                <div class="rounded-md border border-gray-700 bg-gray-800/60 p-3">
                  <label class="flex items-center justify-between gap-3">
                    <span>
                      <span class="block text-xs font-semibold uppercase tracking-wide text-gray-400">Bold text</span>
                      <span class="mt-1 block text-sm font-bold text-white">{{ isBoldText ? 'Enabled' : 'Disabled' }}</span>
                    </span>
                    <input
                      v-model="isBoldText"
                      type="checkbox"
                      class="size-5 rounded border-gray-600 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                    >
                  </label>
                </div>
              </div>
            </section>

            <section class="rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl">
              <h2 class="text-base font-bold text-white">Next steps</h2>
              <ul class="mt-4 space-y-2 text-sm text-gray-300">
                <li class="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-indigo-200">EPUB import workflow</li>
                <li class="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-indigo-200">Local library registry</li>
                <li class="rounded-md border border-indigo-500/30 bg-indigo-500/10 px-3 py-2 text-indigo-200">Bookmarks and progress</li>
              </ul>
            </section>
          </aside>
        </div>

        <section id="library" class="mt-6 grid gap-4 md:grid-cols-3">
          <article
            v-for="item in libraryItems"
            :key="item.title"
            class="rounded-lg border border-gray-700 bg-gray-900 p-5 shadow-xl"
          >
            <component :is="item.icon" class="size-7 text-indigo-600" aria-hidden="true" />
            <h3 class="mt-4 text-lg font-bold text-white">{{ item.title }}</h3>
            <p class="mt-2 text-sm text-gray-400">
              {{ item.description }}
            </p>
          </article>
        </section>
      </section>

      <AppFooter />
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgb(17 24 39);
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(55 65 81);
  border-radius: 9999px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgb(75 85 99);
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(55 65 81) rgb(17 24 39);
}

</style>
