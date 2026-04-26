<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  Bars3Icon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon,
  MoonIcon,
  SunIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'
import { sampleBooks } from '~/data/sampleBooks'
import {
  type GutendexBook,
  getAuthorName,
  getCoverUrl,
  getEpubUrl,
  getGutendexBook,
  popularGutendexBooks,
  searchGutendexBooks,
} from '~/composables/useGutendex'

const sidebarOpen = ref(false)
const sidebarCollapsed = ref(false)
const route = useRoute()
const searchQuery = ref('')
const mode = ref<'day' | 'night'>('day')
const warmth = ref(38)
const fontSize = ref(19)
const lineHeight = ref(1.75)
const isBoldText = ref(false)
const selectedTypeface = ref('serif')
const readerExpanded = ref(false)
const isDraggingBook = ref(false)
const dragDepth = ref(0)
const bookInputRef = ref<HTMLInputElement | null>(null)

const activeBook = sampleBooks[0]
const activeBookFile = ref<string>(activeBook.file)
const activeBookTitle = ref<string>(activeBook.title)
const activeBookAuthor = ref<string>(activeBook.author)
const activeBookSource = ref<string>(activeBook.source)
const importedBookUrl = ref<string | null>(null)
const blockedReaderMessage = ref('')
const blockedReaderUrl = ref('')

const typefaces = [
  { label: 'Serif', value: 'serif', stack: 'Georgia, Cambria, "Times New Roman", serif' },
  { label: 'System', value: 'system', stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { label: 'Readable Sans', value: 'readable-sans', stack: '"Helvetica Neue", Arial, sans-serif' },
  { label: 'Mono', value: 'mono', stack: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' },
]

const navItems = [
  { label: 'Reader', href: '/#reader' },
  { label: 'Library', href: '/library/' },
  { label: 'About', href: '/about/' },
]

const searchResults = ref<GutendexBook[]>([])
const isSearching = ref(false)
const showSearchResults = ref(false)
let searchTimer: ReturnType<typeof setTimeout> | null = null
let searchAbort: AbortController | null = null

const popularBooks = ref<GutendexBook[]>([])
const isLoadingPopular = ref(true)
const popularError = ref('')

const isHomePage = computed(() => route.path === '/')
const isLibraryPage = computed(() => route.path === '/library/' || route.path === '/library')
const isAboutPage = computed(() => route.path === '/about/' || route.path === '/about')
if (route.path === '/') {
  useSeo('home')
}

const readerStyle = computed(() => {
  const currentTypeface = typefaces.find((t) => t.value === selectedTypeface.value)
  const baseStyle = {
    fontFamily: currentTypeface?.stack ?? typefaces[0].stack,
    fontWeight: isBoldText.value ? '700' : '400',
  }

  if (mode.value === 'night') {
    return { ...baseStyle, backgroundColor: '#0b0b0b', color: '#f5f5f5' }
  }

  const mix = warmth.value / 100
  const start = [255, 255, 255]
  const end = [246, 232, 198]
  const rgb = start.map((c, i) => Math.round(c + (end[i] - c) * mix))
  return { ...baseStyle, backgroundColor: `rgb(${rgb.join(', ')})`, color: '#111827' }
})

const readerTextStyle = computed(() => ({
  fontSize: `${fontSize.value}px`,
  lineHeight: String(lineHeight.value),
  fontFamily: readerStyle.value.fontFamily,
  fontWeight: readerStyle.value.fontWeight,
}))

const openSidebar = () => { sidebarOpen.value = true }
const closeSidebar = () => { sidebarOpen.value = false }

const isBrowserReadableEpub = (url: string) => {
  if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) return true
  if (typeof window === 'undefined') return false

  try {
    return new URL(url, window.location.href).origin === window.location.origin
  } catch {
    return false
  }
}

const loadGutendexBook = (book: GutendexBook) => {
  const epubUrl = getEpubUrl(book)
  if (!epubUrl) {
    popularError.value = `No EPUB available for "${book.title}".`
    return
  }
  if (importedBookUrl.value) {
    URL.revokeObjectURL(importedBookUrl.value)
    importedBookUrl.value = null
  }
  activeBookFile.value = epubUrl
  activeBookTitle.value = book.title
  activeBookAuthor.value = getAuthorName(book)
  activeBookSource.value = 'Project Gutenberg'
  blockedReaderUrl.value = epubUrl
  blockedReaderMessage.value = isBrowserReadableEpub(epubUrl)
    ? ''
    : 'This Project Gutenberg EPUB is hosted on another domain without browser CORS access, so toread.me cannot open it directly from the static site. Open the source EPUB or use a local EPUB file.'
  searchQuery.value = ''
  searchResults.value = []
  showSearchResults.value = false
  closeSidebar()
  if (typeof window !== 'undefined') {
    document.getElementById('reader')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const loadedRouteBookId = ref('')

const loadRouteBook = async () => {
  if (route.path !== '/') return
  const routeBook = Array.isArray(route.query.book) ? route.query.book[0] : route.query.book
  if (!routeBook || routeBook === loadedRouteBookId.value) return
  loadedRouteBookId.value = routeBook

  try {
    const book = await getGutendexBook(routeBook)
    loadGutendexBook(book)
  } catch {
    popularError.value = 'Could not open this Gutenberg book.'
  }
}

watch(searchQuery, (q) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchAbort?.abort()
  if (!q.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  searchTimer = setTimeout(async () => {
    searchAbort = new AbortController()
    isSearching.value = true
    try {
      const results = await searchGutendexBooks(q, searchAbort.signal)
      searchResults.value = results.slice(0, 8)
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        searchResults.value = []
      }
    } finally {
      isSearching.value = false
    }
  }, 300)
})

watch(
  () => [route.path, route.query.book],
  () => {
    void loadRouteBook()
  },
  { immediate: true },
)

const setImportedBook = (file: File) => {
  if (!file.name.toLowerCase().endsWith('.epub')) return
  if (importedBookUrl.value) URL.revokeObjectURL(importedBookUrl.value)
  const url = URL.createObjectURL(file)
  importedBookUrl.value = url
  activeBookFile.value = url
  activeBookTitle.value = file.name.replace(/\.epub$/i, '')
  activeBookAuthor.value = 'Local import'
  activeBookSource.value = 'Your device'
  blockedReaderMessage.value = ''
  blockedReaderUrl.value = ''
}

const handleBookInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) setImportedBook(file)
  input.value = ''
}

const hasFiles = (event: DragEvent) =>
  Array.from(event.dataTransfer?.types ?? []).includes('Files')

const handleGlobalDragEnter = (event: DragEvent) => {
  if (!hasFiles(event)) return
  dragDepth.value++
  isDraggingBook.value = true
}

const handleGlobalDragLeave = (event: DragEvent) => {
  if (!hasFiles(event)) return
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  if (dragDepth.value === 0) isDraggingBook.value = false
}

const handleGlobalDragOver = (event: DragEvent) => {
  if (hasFiles(event)) event.preventDefault()
}

const handleGlobalDrop = (event: DragEvent) => {
  event.preventDefault()
  dragDepth.value = 0
  isDraggingBook.value = false
  const file = event.dataTransfer?.files?.[0]
  if (file) setImportedBook(file)
}

const enterFullscreen = async () => {
  readerExpanded.value = true
  if (typeof document === 'undefined') return
  if (document.fullscreenElement) return
  try {
    await document.documentElement.requestFullscreen()
  } catch {
    // Browser may block fullscreen; expanded mode still applies via CSS.
  }
}

const exitFullscreen = async () => {
  readerExpanded.value = false
  if (typeof document === 'undefined') return
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch {
      // ignore
    }
  }
}

const toggleFullscreen = () => {
  if (readerExpanded.value) exitFullscreen()
  else enterFullscreen()
}

const onFullscreenChange = () => {
  if (!document.fullscreenElement && readerExpanded.value) {
    readerExpanded.value = false
  }
}

const fullscreenSettingsTriggerClass = computed(() => [
  'inline-flex rounded-full p-2 backdrop-blur-sm transition-colors focus:outline-none',
  mode.value === 'night'
    ? 'bg-white/10 text-white hover:bg-white/20'
    : 'bg-black/5 text-gray-800 hover:bg-black/10',
])

onMounted(async () => {
  window.addEventListener('dragenter', handleGlobalDragEnter)
  window.addEventListener('dragleave', handleGlobalDragLeave)
  window.addEventListener('dragover', handleGlobalDragOver)
  window.addEventListener('drop', handleGlobalDrop)
  document.addEventListener('fullscreenchange', onFullscreenChange)

  try {
    const books = await popularGutendexBooks()
    popularBooks.value = books.slice(0, 12)
  } catch (e) {
    popularError.value = (e as Error).message || 'Could not load popular books.'
  } finally {
    isLoadingPopular.value = false
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('dragenter', handleGlobalDragEnter)
  window.removeEventListener('dragleave', handleGlobalDragLeave)
  window.removeEventListener('dragover', handleGlobalDragOver)
  window.removeEventListener('drop', handleGlobalDrop)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (importedBookUrl.value) URL.revokeObjectURL(importedBookUrl.value)
})
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100">
    <template>
    <header
      v-show="!readerExpanded"
      class="sticky top-0 z-40 bg-gray-900 shadow-sm"
    >
      <div class="w-full px-2 sm:px-4 lg:px-6">
        <div class="relative flex h-16 items-center gap-3">
          <button
            type="button"
            class="rounded-md p-2 text-gray-200 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
            aria-label="Open sidebar"
            @click="openSidebar"
          >
            <Bars3Icon class="size-6" aria-hidden="true" />
          </button>

          <a
            href="/"
            class="flex shrink-0 items-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            aria-label="toread.me home"
          >
            <img
              src="/images/toread-logo.webp"
              width="34"
              height="34"
              alt="toread.me"
              class="h-8 w-8 rounded-full"
            >
          </a>

          <nav class="hidden items-center gap-1 lg:ml-4 lg:flex" aria-label="Primary">
            <a
              v-for="item in navItems"
              :key="item.label"
              :href="item.href"
              class="rounded-md px-3 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              :class="(item.label === 'Library' && isLibraryPage) || (item.label === 'Reader' && isHomePage) || (item.label === 'About' && isAboutPage) ? 'bg-indigo-600 text-white hover:bg-indigo-600' : ''"
            >
              {{ item.label }}
            </a>
          </nav>

          <div class="ml-auto flex flex-1 justify-center px-2 lg:justify-end" role="search">
            <div class="relative w-full max-w-md">
              <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
              <input
                v-model="searchQuery"
                type="search"
                inputmode="search"
                enterkeyhint="search"
                autocomplete="off"
                spellcheck="false"
                class="block w-full rounded-md border-2 border-gray-700 bg-gray-800 py-1.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-400 transition-colors focus:border-transparent focus:bg-white focus:text-gray-900 focus:ring-2 focus:ring-indigo-400"
                placeholder="Search Project Gutenberg..."
                @focus="showSearchResults = true"
                @blur="setTimeout(() => (showSearchResults = false), 150)"
              >
              <div
                v-if="showSearchResults && searchQuery.trim()"
                class="absolute z-50 mt-1 w-full overflow-hidden rounded-md border border-gray-700 bg-gray-900 text-sm text-gray-100 shadow-lg"
              >
                <p v-if="isSearching" class="px-4 py-3 text-xs text-gray-400">Searching…</p>
                <ul v-else-if="searchResults.length" class="max-h-80 overflow-y-auto">
                  <li v-for="book in searchResults" :key="book.id">
                    <button
                      type="button"
                      class="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-800"
                      @mousedown.prevent="loadGutendexBook(book)"
                    >
                      <span class="flex-1">
                        <span class="block truncate text-sm font-semibold text-white">{{ book.title }}</span>
                        <span class="block truncate text-xs text-gray-400">{{ getAuthorName(book) }}</span>
                      </span>
                    </button>
                  </li>
                </ul>
                <p v-else class="px-4 py-3 text-xs text-gray-400">No results.</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="hidden rounded-md p-2 text-gray-200 transition-colors hover:bg-gray-800 hover:text-white sm:inline-flex"
              aria-label="Open EPUB"
              title="Open EPUB"
              @click="bookInputRef?.click()"
            >
              <DocumentArrowUpIcon class="size-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              class="hidden rounded-md p-2 text-gray-200 transition-colors hover:bg-gray-800 hover:text-white sm:inline-flex"
              :aria-label="mode === 'day' ? 'Switch to night mode' : 'Switch to day mode'"
              :title="mode === 'day' ? 'Night mode' : 'Day mode'"
              @click="mode = mode === 'day' ? 'night' : 'day'"
            >
              <MoonIcon v-if="mode === 'day'" class="size-5" aria-hidden="true" />
              <SunIcon v-else class="size-5" aria-hidden="true" />
            </button>

            <ReaderSettingsPopover
              v-model:mode="mode"
              v-model:warmth="warmth"
              v-model:font-size="fontSize"
              v-model:line-height="lineHeight"
              v-model:is-bold-text="isBoldText"
              v-model:selected-typeface="selectedTypeface"
              :typefaces="typefaces"
            />
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="sidebarOpen && !readerExpanded"
      class="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
      @click="closeSidebar"
    />

    <aside
      v-show="!readerExpanded"
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

      <nav
        class="custom-scrollbar flex-1 overflow-y-auto pb-8 pt-6"
        :class="sidebarCollapsed ? 'px-3' : 'px-4'"
      >
        <p v-if="!sidebarCollapsed" class="mb-2 px-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Ebook Reader
        </p>

        <ul class="space-y-2" :class="sidebarCollapsed ? 'flex flex-col items-center' : ''">
          <li>
            <a
              href="/#reader"
              class="flex items-center gap-3 rounded-md p-2 text-sm font-semibold transition-colors hover:bg-gray-800 hover:text-white"
              :class="isHomePage ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-200'"
              @click="closeSidebar"
            >
              <BookOpenIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Reader</span>
            </a>
          </li>
          <li>
            <button
              type="button"
              class="flex items-center gap-3 rounded-md p-2 text-left text-sm font-semibold text-gray-200 transition-colors hover:bg-gray-800 hover:text-white"
              :class="sidebarCollapsed ? '' : 'w-full'"
              @click="bookInputRef?.click(); closeSidebar()"
            >
              <DocumentArrowUpIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Open EPUB</span>
            </button>
          </li>
          <li>
            <a
              href="/library/"
              class="flex items-center gap-3 rounded-md p-2 text-sm font-semibold transition-colors hover:bg-gray-800 hover:text-white"
              :class="isLibraryPage ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-200'"
              @click="closeSidebar"
            >
              <BuildingLibraryIcon class="size-6 shrink-0" aria-hidden="true" />
              <span v-if="!sidebarCollapsed">Library</span>
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
      :class="readerExpanded ? '' : (sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72')"
    >
      <section
        v-if="isHomePage"
        v-show="!readerExpanded"
        class="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8"
      >
        <div class="rounded-lg border border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800/80 p-4 shadow-xl sm:p-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-indigo-400">Now reading</p>
          <h1 class="mt-1 text-xl font-bold text-white sm:text-2xl">
            {{ activeBookTitle }}
          </h1>
          <p class="mt-1 text-sm text-gray-400">
            {{ activeBookAuthor }} · {{ activeBookSource }}
          </p>
        </div>
      </section>

      <section
        v-if="isHomePage"
        id="reader"
        :class="readerExpanded
          ? 'fixed inset-0 z-[60]'
          : 'mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8'"
        :style="readerExpanded ? { backgroundColor: readerStyle.backgroundColor } : undefined"
      >
        <ClientOnly>
          <EbookReader
            :key="activeBookFile"
            :file="activeBookFile"
            :mode="mode"
            :reader-style="readerStyle"
            :reader-text-style="readerTextStyle"
            :reader-expanded="readerExpanded"
            :blocked-message="blockedReaderMessage"
            :blocked-url="blockedReaderUrl"
            @toggle-expanded="toggleFullscreen"
          />
          <template #fallback>
            <article
              class="relative mx-auto flex h-[70vh] max-w-3xl items-center justify-center rounded-lg border border-gray-700 text-sm font-semibold shadow-xl"
              :style="readerStyle"
            >
              Loading ebook reader...
            </article>
          </template>
        </ClientOnly>

        <div
          v-if="readerExpanded"
          class="absolute z-[70]"
          :style="{
            top: 'max(1rem, env(safe-area-inset-top, 0px))',
            right: 'calc(max(1rem, env(safe-area-inset-right, 0px)) + 3rem)',
          }"
        >
          <ReaderSettingsPopover
            v-model:mode="mode"
            v-model:warmth="warmth"
            v-model:font-size="fontSize"
            v-model:line-height="lineHeight"
            v-model:is-bold-text="isBoldText"
            v-model:selected-typeface="selectedTypeface"
            :typefaces="typefaces"
            :trigger-class="fullscreenSettingsTriggerClass"
          />
        </div>
      </section>

      <section
        v-if="isHomePage"
        v-show="!readerExpanded"
        id="popular"
        class="mx-auto max-w-5xl px-4 pb-10 sm:px-6 lg:px-8"
      >
        <div class="flex items-end justify-between">
          <div>
            <h2 class="text-base font-bold uppercase tracking-wide text-gray-400">Popular reads</h2>
            <p class="mt-1 text-sm text-gray-500">A small preview from Project Gutenberg.</p>
          </div>
          <NuxtLink
            to="/library/"
            class="rounded-md px-3 py-2 text-sm font-semibold text-indigo-300 transition-colors hover:bg-gray-800 hover:text-white"
          >
            Open library
          </NuxtLink>
        </div>

        <div v-if="isLoadingPopular" class="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" aria-live="polite">
          <div
            v-for="i in 8"
            :key="i"
            class="library-skeleton relative aspect-[2/3] overflow-hidden rounded-lg border border-indigo-500/30 bg-gray-900 shadow-xl shadow-indigo-950/30"
          />
        </div>

        <p v-else-if="popularError" class="mt-4 text-sm text-red-400">{{ popularError }}</p>

        <div v-else class="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          <button
            v-for="book in popularBooks"
            :key="book.id"
            type="button"
            class="group flex flex-col overflow-hidden rounded-lg border border-gray-700 bg-gray-900 text-left shadow-xl transition-colors hover:border-indigo-500 hover:bg-gray-800/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            @click="loadGutendexBook(book)"
          >
            <div class="relative aspect-[2/3] overflow-hidden bg-gray-800">
              <img
                v-if="getCoverUrl(book)"
                :src="getCoverUrl(book)!"
                :alt="`Cover of ${book.title}`"
                loading="lazy"
                class="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              >
              <div v-else class="flex h-full items-center justify-center p-3 text-center text-xs font-semibold text-gray-500">
                No cover
              </div>
            </div>
            <div class="flex flex-1 flex-col gap-1 p-3">
              <p class="line-clamp-2 text-sm font-bold text-white">{{ book.title }}</p>
              <p class="line-clamp-1 text-xs text-gray-400">{{ getAuthorName(book) }}</p>
            </div>
          </button>
        </div>
      </section>

      <NuxtPage v-if="!isHomePage && !readerExpanded" />

      <AppFooter v-show="!readerExpanded" />
    </main>

    <input
      ref="bookInputRef"
      class="hidden"
      type="file"
      accept=".epub,application/epub+zip"
      @change="handleBookInput"
    >

    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isDraggingBook"
        class="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center bg-indigo-900/50 backdrop-blur-sm"
      >
        <div class="rounded-2xl border-2 border-dashed border-indigo-300 bg-gray-900/90 px-8 py-7 text-center shadow-2xl">
          <DocumentArrowUpIcon class="mx-auto size-10 text-indigo-300" aria-hidden="true" />
          <p class="mt-3 text-base font-bold text-white">Drop your EPUB to open it</p>
          <p class="mt-1 text-xs text-gray-300">The file stays on your device.</p>
        </div>
      </div>
    </transition>
    </template>

    <CookieConsent />
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

.library-skeleton::before {
  position: absolute;
  inset: 0;
  z-index: 1;
  content: "";
  background:
    linear-gradient(
      110deg,
      transparent 0%,
      transparent 28%,
      rgba(129, 140, 248, 0.34) 45%,
      rgba(255, 255, 255, 0.2) 50%,
      rgba(129, 140, 248, 0.34) 55%,
      transparent 72%,
      transparent 100%
    );
  transform: translateX(-100%);
  animation: library-shimmer 1.15s ease-in-out infinite;
}

.library-skeleton::after {
  position: absolute;
  inset: 0;
  z-index: 0;
  content: "";
  background:
    radial-gradient(circle at 20% 16%, rgba(99, 102, 241, 0.28), transparent 28%),
    linear-gradient(180deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.92));
}

@keyframes library-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
