export type GutendexAuthor = {
  name: string
  birth_year?: number | null
  death_year?: number | null
}

export type GutendexBook = {
  id: number
  title: string
  authors: GutendexAuthor[]
  subjects?: string[]
  bookshelves?: string[]
  summaries?: string[]
  languages: string[]
  formats: Record<string, string>
  download_count: number
}

export type GutendexResponse = {
  count: number
  next: string | null
  previous: string | null
  results: GutendexBook[]
}

const DIRECT_BASE = 'https://gutendex.com/books/'
const PROXY_BASE = '/api/gutendex.php'

export type GutendexListParams = {
  search?: string
  topic?: string
  languages?: string | string[]
  sort?: 'ascending' | 'descending' | 'popular'
  page?: number
  signal?: AbortSignal
}

const buildListUrl = (
  base: string,
  { search, topic, languages, sort = 'popular', page }: GutendexListParams = {},
) => {
  const params = new URLSearchParams()
  if (search?.trim()) params.set('search', search.trim())
  if (topic?.trim()) params.set('topic', topic.trim())
  if (sort) params.set('sort', sort)
  if (page && page > 1) params.set('page', String(page))
  if (languages && (!Array.isArray(languages) || languages.length > 0)) {
    params.set('languages', Array.isArray(languages) ? languages.join(',') : languages)
  }
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

const PER_ATTEMPT_TIMEOUT_MS = 18000

const fetchJsonAttempt = async <T>(
  url: string,
  externalSignal: AbortSignal | undefined,
  raceSignal: AbortSignal,
): Promise<T> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), PER_ATTEMPT_TIMEOUT_MS)
  const onExternalAbort = () => controller.abort(externalSignal?.reason)
  const onRaceAbort = () => controller.abort(raceSignal.reason)
  externalSignal?.addEventListener('abort', onExternalAbort, { once: true })
  raceSignal.addEventListener('abort', onRaceAbort, { once: true })
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`Gutendex request failed: ${res.status}`)
    return (await res.json()) as T
  } finally {
    clearTimeout(timeoutId)
    externalSignal?.removeEventListener('abort', onExternalAbort)
    raceSignal.removeEventListener('abort', onRaceAbort)
  }
}

const fetchGutendexJson = async <T>(proxyUrl: string, directUrl: string, signal?: AbortSignal): Promise<T> => {
  if (typeof window === 'undefined') {
    return await fetchJsonAttempt<T>(directUrl, signal, new AbortController().signal)
  }

  const raceController = new AbortController()
  try {
    const winner = await Promise.any([
      fetchJsonAttempt<T>(proxyUrl, signal, raceController.signal),
      fetchJsonAttempt<T>(directUrl, signal, raceController.signal),
    ])
    return winner
  } catch (error) {
    if (signal?.aborted) throw signal.reason ?? error
    if (error instanceof AggregateError) {
      throw error.errors[0] instanceof Error
        ? error.errors[0]
        : new Error('Gutendex request failed')
    }
    throw error
  } finally {
    raceController.abort()
  }
}

export const listGutendexBooks = async ({
  search,
  topic,
  languages,
  sort = 'popular',
  page,
  signal,
}: GutendexListParams = {}): Promise<GutendexResponse> => {
  const params = { search, topic, languages, sort, page }
  const proxyUrl = buildListUrl(PROXY_BASE, params)
  const directUrl = buildListUrl(DIRECT_BASE, params)
  return await fetchGutendexJson<GutendexResponse>(proxyUrl, directUrl, signal)
}

export const searchGutendexBooks = async (
  query: string,
  signal?: AbortSignal,
): Promise<GutendexBook[]> => {
  const trimmed = query.trim()
  if (!trimmed) return []
  const data = await listGutendexBooks({ search: trimmed, signal })
  return data.results ?? []
}

export const popularGutendexBooks = async (
  signal?: AbortSignal,
): Promise<GutendexBook[]> => {
  const data = await listGutendexBooks({ sort: 'popular', languages: 'en', signal })
  return data.results ?? []
}

export const getGutendexBook = async (
  id: number | string,
  signal?: AbortSignal,
): Promise<GutendexBook> => {
  const safeId = encodeURIComponent(String(id))
  const proxyUrl = `${PROXY_BASE}?id=${safeId}`
  const directUrl = `${DIRECT_BASE}${safeId}`
  return await fetchGutendexJson<GutendexBook>(proxyUrl, directUrl, signal)
}

export const getReaderEpubUrl = (url: string): string => {
  if (url.startsWith('/') || url.startsWith('blob:') || url.startsWith('data:')) return url
  return `/api/epub.php?url=${encodeURIComponent(url)}`
}

export const getEpubUrl = (book: GutendexBook): string | null => {
  const fmts = book.formats
  const direct = fmts['application/epub+zip']
  if (direct) return direct
  const fallbackKey = Object.keys(fmts).find((k) => k.includes('epub'))
  return fallbackKey ? fmts[fallbackKey] : null
}

export const getCoverUrl = (book: GutendexBook): string | null => {
  return book.formats['image/jpeg'] ?? null
}

export const getAuthorName = (book: GutendexBook): string => {
  if (!book.authors?.length) return 'Unknown author'
  return book.authors.map((a) => a.name).join(', ')
}
