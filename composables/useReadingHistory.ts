import { ref } from 'vue'

export type HistorySource = 'sample' | 'gutenberg' | 'local'

export type HistoryEntry = {
  source: HistorySource
  bookId?: string
  fileName?: string
  title: string
  author: string
  cfi: string
  progress: number
  savedAt: number
  epubUrl?: string
  coverUrl?: string
}

const STORAGE_KEY = 'toread:reading-history'
const MAX_ENTRIES = 5

const history = ref<HistoryEntry[]>([])
let hydrated = false

const entryKey = (entry: Pick<HistoryEntry, 'source' | 'bookId' | 'fileName'>): string => {
  if (entry.source === 'gutenberg') return `gutenberg:${entry.bookId ?? ''}`
  if (entry.source === 'local') return `local:${entry.fileName ?? ''}`
  return 'sample'
}

const sanitize = (raw: unknown): HistoryEntry[] => {
  if (!Array.isArray(raw)) return []
  const out: HistoryEntry[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const e = item as Partial<HistoryEntry>
    if (e.source !== 'sample' && e.source !== 'gutenberg' && e.source !== 'local') continue
    if (typeof e.title !== 'string' || typeof e.cfi !== 'string') continue
    if (e.source === 'gutenberg' && typeof e.bookId !== 'string') continue
    if (e.source === 'local' && typeof e.fileName !== 'string') continue
    out.push({
      source: e.source,
      bookId: e.bookId,
      fileName: e.fileName,
      title: e.title,
      author: typeof e.author === 'string' ? e.author : '',
      cfi: e.cfi,
      progress: typeof e.progress === 'number' ? Math.max(0, Math.min(1, e.progress)) : 0,
      savedAt: typeof e.savedAt === 'number' ? e.savedAt : Date.now(),
      epubUrl: typeof e.epubUrl === 'string' ? e.epubUrl : undefined,
      coverUrl: typeof e.coverUrl === 'string' ? e.coverUrl : undefined,
    })
  }
  return out.sort((a, b) => b.savedAt - a.savedAt).slice(0, MAX_ENTRIES)
}

const hydrate = () => {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) history.value = sanitize(JSON.parse(raw))
  } catch {
    history.value = []
  }
}

const persist = () => {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch {
    // Quota or privacy mode: silently ignore.
  }
}

const upsertHistory = (entry: HistoryEntry) => {
  hydrate()
  const key = entryKey(entry)
  const next = history.value.filter((e) => entryKey(e) !== key)
  next.unshift(entry)
  history.value = next.slice(0, MAX_ENTRIES)
  persist()
}

const removeHistory = (key: string) => {
  hydrate()
  history.value = history.value.filter((e) => entryKey(e) !== key)
  persist()
}

const clearHistory = () => {
  hydrate()
  history.value = []
  persist()
}

export const useReadingHistory = () => {
  hydrate()
  return {
    history,
    upsertHistory,
    removeHistory,
    clearHistory,
    entryKey,
  }
}
