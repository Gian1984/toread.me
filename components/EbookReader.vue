<script setup lang="ts">
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  file: string
  mode: 'day' | 'night'
  readerStyle: Record<string, string>
  readerTextStyle: Record<string, string>
  readerExpanded: boolean
  blockedMessage?: string
  blockedUrl?: string
}>()

const emit = defineEmits<{
  toggleExpanded: []
}>()

const areaRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
const errorLink = ref('')
const currentPage = ref(1)
const totalPages = ref<number | null>(null)

let book: any
let rendition: any
let resizeFrame: number | null = null

const applyTheme = () => {
  if (!rendition) return

  const background = props.readerStyle.backgroundColor
  const color = props.readerStyle.color
  const fontFamily = props.readerTextStyle.fontFamily
  const fontSize = props.readerTextStyle.fontSize
  const fontWeight = props.readerTextStyle.fontWeight
  const lineHeight = props.readerTextStyle.lineHeight

  rendition.themes.register('toread', {
    body: {
      background: `${background} !important`,
      color: `${color} !important`,
      'font-family': `${fontFamily} !important`,
      'font-size': `${fontSize} !important`,
      'font-weight': `${fontWeight} !important`,
      'line-height': `${lineHeight} !important`,
      margin: '0 !important',
      padding: '0 !important',
    },
    p: {
      'font-family': `${fontFamily} !important`,
      'font-size': `${fontSize} !important`,
      'font-weight': `${fontWeight} !important`,
      'line-height': `${lineHeight} !important`,
      color: `${color} !important`,
    },
    h1: {
      'font-family': `${fontFamily} !important`,
      color: `${color} !important`,
    },
    h2: {
      'font-family': `${fontFamily} !important`,
      color: `${color} !important`,
    },
  })

  rendition.themes.select('toread')
}

const resizeRendition = () => {
  if (!rendition || !areaRef.value) return
  if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
  resizeFrame = requestAnimationFrame(() => {
    const { width, height } = areaRef.value!.getBoundingClientRect()
    if (width > 0 && height > 0) {
      rendition.resize(Math.floor(width), Math.floor(height))
    }
  })
}

const showPrevious = () => rendition?.prev()
const showNext = () => rendition?.next()

const updateLocation = (location: any) => {
  if (!book?.locations || !location?.start?.cfi) return
  const page = book.locations.locationFromCfi(location.start.cfi)
  const total = book.locations.length()
  if (typeof page === 'number' && page >= 0) currentPage.value = page + 1
  if (typeof total === 'number' && total > 0) totalPages.value = total
}

const destroyReader = () => {
  rendition?.destroy?.()
  book?.destroy?.()
  rendition = undefined
  book = undefined
}

const loadBook = async () => {
  if (!areaRef.value) return
  destroyReader()
  loading.value = true
  error.value = ''
  errorLink.value = ''
  currentPage.value = 1
  totalPages.value = null

  if (props.blockedMessage) {
    error.value = props.blockedMessage
    errorLink.value = props.blockedUrl ?? ''
    loading.value = false
    return
  }

  try {
    const epub = (await import('epubjs')).default
    book = epub(props.file)
    rendition = book.renderTo(areaRef.value, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: 'none',
    })

    applyTheme()
    await Promise.race([
      rendition.display(),
      new Promise((_, reject) => {
        window.setTimeout(() => {
          reject(new Error('The ebook took too long to load. The remote server may be blocking browser access.'))
        }, 12000)
      }),
    ])
    rendition.on('relocated', updateLocation)
    book.ready
      .then(() => book.locations.generate(1200))
      .then(() => {
        totalPages.value = book.locations.length()
        updateLocation(rendition.currentLocation())
      })
    loading.value = false
  } catch (err) {
    error.value = props.blockedUrl
      ? 'This Gutenberg EPUB could not be loaded through the server proxy before timeout. Open the source EPUB or try another book.'
      : err instanceof Error ? err.message : 'Unable to load ebook'
    errorLink.value = props.blockedUrl ?? ''
    loading.value = false
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.target instanceof HTMLElement) {
    const tag = event.target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
  }
  if (event.key === 'ArrowLeft') showPrevious()
  else if (event.key === 'ArrowRight') showNext()
}

onMounted(async () => {
  await loadBook()
  window.addEventListener('resize', resizeRendition)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeRendition)
  window.removeEventListener('keydown', handleKeydown)
  if (resizeFrame !== null) cancelAnimationFrame(resizeFrame)
  destroyReader()
})

watch(
  () => props.file,
  async () => {
    await nextTick()
    await loadBook()
  },
)

watch(
  () => props.blockedMessage,
  async () => {
    await nextTick()
    await loadBook()
  },
)

watch(
  () => [props.readerStyle, props.readerTextStyle],
  async () => {
    await nextTick()
    applyTheme()
    resizeRendition()
  },
  { deep: true },
)

watch(
  () => props.readerExpanded,
  async () => {
    await nextTick()
    resizeRendition()
  },
)

const controlButtonClass = computed(() => [
  'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
  props.mode === 'night'
    ? 'text-white hover:bg-white/10'
    : 'text-gray-800 hover:bg-black/5',
])

const dividerClass = computed(() =>
  props.mode === 'night' ? 'border-white/15' : 'border-black/10',
)

const contentPaddingStyle = computed(() => {
  if (props.readerExpanded) {
    return {
      paddingTop: 'max(3.5rem, env(safe-area-inset-top, 0px))',
      paddingBottom: '1rem',
      paddingLeft: 'max(2rem, env(safe-area-inset-left, 0px))',
      paddingRight: 'max(2rem, env(safe-area-inset-right, 0px))',
    }
  }
  return {
    paddingTop: '3rem',
    paddingBottom: '0.75rem',
    paddingLeft: '1.5rem',
    paddingRight: '1.5rem',
  }
})
</script>

<template>
  <article
    class="relative flex flex-col overflow-hidden transition-colors"
    :class="readerExpanded
      ? 'h-[100dvh] w-full'
      : 'mx-auto h-[min(78vh,720px)] max-w-3xl rounded-lg border border-gray-700 shadow-xl'"
    :style="readerStyle"
  >
    <button
      type="button"
      class="absolute right-4 top-4 z-20 rounded-full p-2 backdrop-blur-sm transition-colors"
      :class="[
        mode === 'night'
          ? 'bg-white/10 text-white hover:bg-white/20'
          : 'bg-black/5 text-gray-800 hover:bg-black/10',
        readerExpanded ? 'top-[max(1rem,env(safe-area-inset-top,0px))] right-[max(1rem,env(safe-area-inset-right,0px))]' : '',
      ]"
      :aria-label="readerExpanded ? 'Exit fullscreen' : 'Enter fullscreen'"
      @click="emit('toggleExpanded')"
    >
      <ArrowsPointingInIcon v-if="readerExpanded" class="size-5" aria-hidden="true" />
      <ArrowsPointingOutIcon v-else class="size-5" aria-hidden="true" />
    </button>

    <div
      class="min-h-0 flex-1"
      :style="contentPaddingStyle"
    >
      <div ref="areaRef" class="h-full w-full overflow-hidden">
        <div v-if="loading" class="flex h-full items-center justify-center text-sm font-semibold opacity-70">
          Loading ebook...
        </div>
        <div v-else-if="error" class="flex h-full items-center justify-center px-6 text-center text-sm font-semibold text-red-400">
          <div class="max-w-md">
            <p>{{ error }}</p>
            <a
              v-if="errorLink"
              :href="errorLink"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-4 inline-flex text-indigo-500 underline-offset-4 hover:underline"
            >
              Open EPUB source
            </a>
          </div>
        </div>
      </div>
    </div>

    <nav
      class="flex shrink-0 items-center justify-between gap-3 border-t px-3 py-2 sm:px-6"
      :class="dividerClass"
      aria-label="Reader pagination"
    >
      <button
        type="button"
        :class="controlButtonClass"
        aria-label="Previous page"
        @click="showPrevious"
      >
        <ChevronLeftIcon class="size-5" aria-hidden="true" />
        <span class="hidden sm:inline">Previous</span>
      </button>

      <span class="text-xs font-bold tabular-nums opacity-80 sm:text-sm">
        Page {{ currentPage }}<span v-if="totalPages"> / {{ totalPages }}</span>
      </span>

      <button
        type="button"
        :class="controlButtonClass"
        aria-label="Next page"
        @click="showNext"
      >
        <span class="hidden sm:inline">Next</span>
        <ChevronRightIcon class="size-5" aria-hidden="true" />
      </button>
    </nav>
  </article>
</template>
