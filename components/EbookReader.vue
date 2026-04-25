<script setup lang="ts">
import {
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from '@heroicons/vue/24/outline'

const props = defineProps<{
  file: string
  mode: 'day' | 'night'
  readerStyle: Record<string, string>
  readerTextStyle: Record<string, string>
  readerExpanded: boolean
  controlClass: string[] | string
}>()

const emit = defineEmits<{
  toggleExpanded: []
}>()

const areaRef = ref<HTMLElement | null>(null)
const loading = ref(true)
const error = ref('')
const currentPage = ref(1)
const totalPages = ref<number | null>(null)

let book: any
let rendition: any

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

const resizeRendition = async () => {
  if (!rendition || !areaRef.value) return

  const { width, height } = areaRef.value.getBoundingClientRect()
  rendition.resize(Math.floor(width), Math.floor(height))
}

const showPrevious = () => {
  rendition?.prev()
}

const showNext = () => {
  rendition?.next()
}

const updateLocation = (location: any) => {
  if (!book?.locations || !location?.start?.cfi) return

  const page = book.locations.locationFromCfi(location.start.cfi)
  const total = book.locations.length()

  if (typeof page === 'number' && page >= 0) {
    currentPage.value = page + 1
  }

  if (typeof total === 'number' && total > 0) {
    totalPages.value = total
  }
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
  currentPage.value = 1
  totalPages.value = null

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
    await rendition.display()
    rendition.on('relocated', updateLocation)
    book.ready.then(() => book.locations.generate(1200)).then(() => {
      totalPages.value = book.locations.length()
      const location = rendition.currentLocation()
      updateLocation(location)
    })
    loading.value = false
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to load ebook'
    loading.value = false
  }
}

onMounted(async () => {
  await loadBook()
  window.addEventListener('resize', resizeRendition)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeRendition)
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
  () => [props.readerStyle, props.readerTextStyle, props.readerExpanded],
  async () => {
    await nextTick()
    applyTheme()
    await resizeRendition()
  },
  { deep: true },
)
</script>

<template>
  <article
    class="relative mx-auto min-h-[540px] rounded-md border border-gray-700 p-8 shadow-xl transition-colors sm:p-12"
    :style="readerStyle"
    :class="[
      mode === 'night' ? 'border-gray-800' : '',
      readerExpanded ? 'max-w-5xl' : 'max-w-3xl',
    ]"
  >
    <button
      type="button"
      class="absolute right-4 top-4 z-10 rounded-md p-2"
      :class="controlClass"
      :aria-label="readerExpanded ? 'Exit full page reader preview' : 'Expand reader preview'"
      @click="emit('toggleExpanded')"
    >
      <ArrowsPointingInIcon v-if="readerExpanded" class="size-5" aria-hidden="true" />
      <ArrowsPointingOutIcon v-else class="size-5" aria-hidden="true" />
    </button>

    <div
      ref="areaRef"
      class="h-[520px] overflow-hidden"
      :class="readerExpanded ? 'sm:h-[calc(100vh-190px)]' : ''"
    >
      <div v-if="loading" class="flex h-full items-center justify-center text-sm font-semibold opacity-70">
        Loading ebook...
      </div>
      <div v-else-if="error" class="flex h-full items-center justify-center text-center text-sm font-semibold text-red-400">
        {{ error }}
      </div>
    </div>

    <nav
      class="mt-6 flex items-center justify-between border-t pt-6"
      :class="mode === 'night' ? 'border-white/20' : 'border-gray-300'"
      aria-label="Reader pagination"
    >
      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md p-1 text-sm font-bold"
        :class="controlClass"
        aria-label="Previous page"
        @click="showPrevious"
      >
        <ArrowLeftIcon class="size-6" aria-hidden="true" />
        <span>Previous</span>
      </button>

      <div
        class="fixed bottom-5 right-5 z-[80] rounded-md border px-3 py-2 text-xs font-bold shadow-lg backdrop-blur"
        :class="mode === 'night' ? 'border-white/20 bg-black/70 text-white' : 'border-gray-300 bg-white/80 text-gray-800'"
      >
        Page {{ currentPage }}<span v-if="totalPages"> / {{ totalPages }}</span>
      </div>

      <button
        type="button"
        class="inline-flex items-center gap-2 rounded-md p-1 text-sm font-bold"
        :class="controlClass"
        aria-label="Next page"
        @click="showNext"
      >
        <span>Next</span>
        <ArrowRightIcon class="size-6" aria-hidden="true" />
      </button>
    </nav>
  </article>
</template>
