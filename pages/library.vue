<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import {
  ArrowPathIcon,
  BookOpenIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/vue/24/outline'
import {
  type GutendexBook,
  getAuthorName,
  getCoverUrl,
  listGutendexBooks,
} from '~/composables/useGutendex'

useSeo('library')

type LibraryCategory = {
  key: string
  title: string
  topic: string
  description: string
}

type CategoryState = {
  books: GutendexBook[]
  page: number
  visible: number
  count: number
  hasMore: boolean
  isLoading: boolean
  error: string
}

const categories: LibraryCategory[] = [
  {
    key: 'fiction',
    title: 'Fiction',
    topic: 'fiction',
    description: 'Novels, short stories, and classic narrative works.',
  },
  {
    key: 'mystery',
    title: 'Mystery',
    topic: 'mystery',
    description: 'Detective stories, suspense, and early crime fiction.',
  },
  {
    key: 'children',
    title: 'Children',
    topic: 'children',
    description: 'Public-domain stories for younger readers.',
  },
  {
    key: 'history',
    title: 'History',
    topic: 'history',
    description: 'Historical writing, memoirs, and primary source texts.',
  },
  {
    key: 'philosophy',
    title: 'Philosophy',
    topic: 'philosophy',
    description: 'Essays, treatises, and works of thought.',
  },
  {
    key: 'science',
    title: 'Science',
    topic: 'science',
    description: 'Scientific classics, natural history, and technical works.',
  },
]

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Italiano', value: 'it' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: 'Português', value: 'pt' },
  { label: 'Ελληνικά', value: 'el' },
]

const selectedLanguage = ref('en')
const query = ref('')
const searchResults = ref<GutendexBook[]>([])
const isSearching = ref(false)
const searchError = ref('')
let searchAbort: AbortController | null = null

const categoryState = reactive<Record<string, CategoryState>>(
  Object.fromEntries(
    categories.map((category) => [
      category.key,
      {
        books: [],
        page: 1,
        visible: 6,
        count: 0,
        hasMore: true,
        isLoading: true,
        error: '',
      },
    ]),
  ) as Record<string, CategoryState>,
)

const activeLanguageLabel = computed(
  () => languages.find((language) => language.value === selectedLanguage.value)?.label ?? 'English',
)

const visibleBooks = (category: LibraryCategory) =>
  categoryState[category.key].books.slice(0, categoryState[category.key].visible)

const loadCategory = async (category: LibraryCategory, reset = false) => {
  const state = categoryState[category.key]
  if (state.isLoading && !reset) return

  if (reset) {
    state.books = []
    state.page = 1
    state.visible = 6
    state.count = 0
    state.hasMore = true
    state.error = ''
  }

  state.isLoading = true
  try {
    const data = await listGutendexBooks({
      topic: category.topic,
      languages: selectedLanguage.value,
      sort: 'popular',
      page: state.page,
    })

    const existing = new Set(state.books.map((book) => book.id))
    const nextBooks = (data.results ?? []).filter((book) => !existing.has(book.id))
    state.books = [...state.books, ...nextBooks]
    state.count = data.count
    state.hasMore = Boolean(data.next)
    state.error = ''
  } catch (error) {
    state.error = (error as Error).message || 'Could not load this category.'
  } finally {
    state.isLoading = false
  }
}

const loadMore = async (category: LibraryCategory) => {
  const state = categoryState[category.key]
  const nextVisible = state.visible + 6

  if (nextVisible <= state.books.length || !state.hasMore) {
    state.visible = Math.min(nextVisible, state.books.length)
    return
  }

  state.page += 1
  state.visible = nextVisible
  await loadCategory(category)
}

const reloadLibrary = async () => {
  await Promise.all(categories.map((category) => loadCategory(category, true)))
}

const searchLibrary = async () => {
  searchAbort?.abort()
  searchError.value = ''
  const term = query.value.trim()
  if (!term) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  searchAbort = new AbortController()
  isSearching.value = true
  try {
    const data = await listGutendexBooks({
      search: term,
      languages: selectedLanguage.value,
      sort: 'popular',
      signal: searchAbort.signal,
    })
    searchResults.value = data.results.slice(0, 12)
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      searchError.value = 'Search is not available right now.'
      searchResults.value = []
    }
  } finally {
    isSearching.value = false
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(query, () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    void searchLibrary()
  }, 250)
})

watch(selectedLanguage, () => {
  searchResults.value = []
  void reloadLibrary()
  if (query.value.trim()) void searchLibrary()
})

onMounted(() => {
  void reloadLibrary()
})
</script>

<template>
  <div class="bg-gray-950 text-gray-100">
    <section class="border-b border-gray-800 bg-gray-950">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-indigo-400">Project Gutenberg Library</p>
          <h1 class="mt-3 text-4xl font-bold tracking-normal text-white sm:text-5xl">
            Browse free public-domain books.
          </h1>
          <p class="mt-4 max-w-3xl text-base leading-7 text-gray-300">
            Explore popular Gutenberg books by topic, filter them by language, and open an EPUB directly in the reader when browser access allows it.
          </p>
        </div>

        <div class="rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
            <FunnelIcon class="size-5" aria-hidden="true" />
            Language filter
          </div>
          <label for="language-filter" class="sr-only">Filter library language</label>
          <select
            id="language-filter"
            v-model="selectedLanguage"
            class="mt-3 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
          >
            <option
              v-for="language in languages"
              :key="language.value"
              :value="language.value"
            >
              {{ language.label }}
            </option>
          </select>
          <p class="mt-3 text-sm text-gray-400">
            Showing popular titles in {{ activeLanguageLabel }}.
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="relative">
        <MagnifyingGlassIcon class="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          v-model="query"
          type="search"
          class="block w-full rounded-lg border-2 border-gray-700 bg-gray-900 py-3 pl-12 pr-4 text-base text-white outline-none placeholder:text-gray-500 transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500"
          placeholder="Search titles and authors in the selected language..."
        >
      </div>

      <div v-if="query.trim()" class="mt-8">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Search results</h2>
            <p class="mt-1 text-sm text-gray-400">Results from Gutendex in {{ activeLanguageLabel }}.</p>
          </div>
          <ArrowPathIcon v-if="isSearching" class="size-5 animate-spin text-indigo-300" aria-hidden="true" />
        </div>

        <p v-if="searchError" class="mt-4 text-sm text-red-300">{{ searchError }}</p>

        <div v-if="isSearching && !searchResults.length" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="i in 6" :key="i" class="library-skeleton aspect-[2/3]" />
        </div>

        <div v-else-if="searchResults.length" class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="book in searchResults"
            :key="book.id"
            :to="`/?book=${book.id}`"
            class="book-card group"
          >
            <span class="book-cover">
              <img
                v-if="getCoverUrl(book)"
                :src="getCoverUrl(book)!"
                :alt="`Cover of ${book.title}`"
                loading="lazy"
                class="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              >
              <span v-else class="flex h-full items-center justify-center p-4 text-center text-xs font-semibold text-gray-500">
                No cover
              </span>
            </span>
            <span class="book-meta">
              <span class="line-clamp-2 text-sm font-bold text-white">{{ book.title }}</span>
              <span class="line-clamp-1 text-xs text-gray-400">{{ getAuthorName(book) }}</span>
            </span>
          </NuxtLink>
        </div>

        <p v-else-if="!isSearching" class="mt-4 rounded-lg border border-gray-800 bg-gray-900 p-4 text-sm text-gray-400">
          No books found for this search.
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl space-y-12 px-4 pb-16 sm:px-6 lg:px-8">
      <section
        v-for="category in categories"
        :key="category.key"
        class="rounded-lg border border-gray-800 bg-gray-900/70 p-4 sm:p-5"
      >
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wide text-indigo-400">{{ category.topic }}</p>
            <h2 class="mt-1 text-2xl font-bold text-white">{{ category.title }}</h2>
            <p class="mt-1 text-sm text-gray-400">{{ category.description }}</p>
          </div>
          <p class="text-sm font-semibold text-gray-500">
            {{ categoryState[category.key].count.toLocaleString() }} results
          </p>
        </div>

        <div
          v-if="categoryState[category.key].isLoading && !categoryState[category.key].books.length"
          class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          aria-live="polite"
        >
          <div v-for="i in 6" :key="i" class="library-skeleton aspect-[2/3]" />
        </div>

        <p v-else-if="categoryState[category.key].error" class="mt-5 text-sm text-red-300">
          {{ categoryState[category.key].error }}
        </p>

        <div v-else class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NuxtLink
            v-for="book in visibleBooks(category)"
            :key="book.id"
            :to="`/?book=${book.id}`"
            class="book-card group"
          >
            <span class="book-cover">
              <img
                v-if="getCoverUrl(book)"
                :src="getCoverUrl(book)!"
                :alt="`Cover of ${book.title}`"
                loading="lazy"
                class="size-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              >
              <span v-else class="flex h-full items-center justify-center p-4 text-center text-xs font-semibold text-gray-500">
                No cover
              </span>
            </span>
            <span class="book-meta">
              <span class="line-clamp-2 text-sm font-bold text-white">{{ book.title }}</span>
              <span class="line-clamp-1 text-xs text-gray-400">{{ getAuthorName(book) }}</span>
              <span class="mt-2 flex items-center gap-1 text-xs font-semibold text-indigo-300">
                <BookOpenIcon class="size-4" aria-hidden="true" />
                {{ book.download_count.toLocaleString() }} reads
              </span>
            </span>
          </NuxtLink>
        </div>

        <div
          v-if="categoryState[category.key].books.length"
          class="mt-5 flex justify-center"
        >
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-md border border-indigo-500/50 px-4 py-2 text-sm font-semibold text-indigo-200 transition-colors hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="categoryState[category.key].isLoading || (!categoryState[category.key].hasMore && categoryState[category.key].visible >= categoryState[category.key].books.length)"
            @click="loadMore(category)"
          >
            <ArrowPathIcon
              v-if="categoryState[category.key].isLoading"
              class="size-4 animate-spin"
              aria-hidden="true"
            />
            Load more
          </button>
        </div>
      </section>
    </section>
  </div>
</template>

<style scoped>
.book-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgb(55 65 81);
  background: rgb(17 24 39);
  text-align: left;
  box-shadow: 0 18px 35px rgba(2, 6, 23, 0.35);
  transition: border-color 150ms ease, background-color 150ms ease;
}

.book-card:hover {
  border-color: rgb(99 102 241);
  background: rgba(31, 41, 55, 0.78);
}

.book-card:focus {
  outline: none;
}

.book-card:focus-visible {
  box-shadow: 0 0 0 2px rgb(99 102 241);
}

.book-cover {
  display: block;
  aspect-ratio: 2 / 3;
  overflow: hidden;
  background: rgb(31 41 55);
}

.book-meta {
  display: flex;
  min-height: 7.5rem;
  flex: 1;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
}

.library-skeleton {
  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  border: 1px solid rgba(99, 102, 241, 0.3);
  background:
    radial-gradient(circle at 20% 16%, rgba(99, 102, 241, 0.32), transparent 28%),
    linear-gradient(180deg, rgba(31, 41, 55, 0.92), rgba(17, 24, 39, 0.95));
  box-shadow: 0 18px 35px rgba(49, 46, 129, 0.24);
}

.library-skeleton::before {
  position: absolute;
  inset: 0;
  content: "";
  background: linear-gradient(
    110deg,
    transparent 0%,
    transparent 30%,
    rgba(129, 140, 248, 0.32) 45%,
    rgba(255, 255, 255, 0.18) 50%,
    rgba(129, 140, 248, 0.32) 55%,
    transparent 72%,
    transparent 100%
  );
  transform: translateX(-100%);
  animation: library-shimmer 1.15s ease-in-out infinite;
}

@keyframes library-shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
