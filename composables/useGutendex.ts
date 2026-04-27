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

const fetchGutendexJson = async <T>(proxyUrl: string, directUrl: string, signal?: AbortSignal): Promise<T> => {
  const urls = typeof window === 'undefined' ? [directUrl] : [proxyUrl, directUrl]
  let lastError: unknown = null

  for (const url of urls) {
    try {
      const res = await fetch(url, { signal })
      if (!res.ok) throw new Error(`Gutendex request failed: ${res.status}`)
      return await res.json()
    } catch (error) {
      if ((error as Error).name === 'AbortError') throw error
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Gutendex request failed')
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
