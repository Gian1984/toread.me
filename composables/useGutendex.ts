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

const appendLanguages = (url: URL, languages?: string | string[]) => {
  if (!languages || (Array.isArray(languages) && languages.length === 0)) return
  url.searchParams.set('languages', Array.isArray(languages) ? languages.join(',') : languages)
}

export const listGutendexBooks = async ({
  search,
  topic,
  languages,
  sort = 'popular',
  page,
  signal,
}: GutendexListParams = {}): Promise<GutendexResponse> => {
  const url = new URL(
    typeof window === 'undefined' ? DIRECT_BASE : PROXY_BASE,
    typeof window === 'undefined' ? DIRECT_BASE : window.location.origin,
  )
  if (search?.trim()) url.searchParams.set('search', search.trim())
  if (topic?.trim()) url.searchParams.set('topic', topic.trim())
  if (sort) url.searchParams.set('sort', sort)
  if (page && page > 1) url.searchParams.set('page', String(page))
  appendLanguages(url, languages)

  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`Gutendex request failed: ${res.status}`)
  return await res.json()
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
  const url =
    typeof window === 'undefined'
      ? new URL(String(id), DIRECT_BASE).toString()
      : `${PROXY_BASE}?id=${encodeURIComponent(String(id))}`
  const res = await fetch(url, { signal })
  if (!res.ok) throw new Error(`Gutendex book failed: ${res.status}`)
  return await res.json()
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
