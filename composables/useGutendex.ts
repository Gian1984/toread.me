export type GutendexAuthor = {
  name: string
  birth_year?: number | null
  death_year?: number | null
}

export type GutendexBook = {
  id: number
  title: string
  authors: GutendexAuthor[]
  languages: string[]
  formats: Record<string, string>
  download_count: number
}

type GutendexResponse = {
  count: number
  next: string | null
  previous: string | null
  results: GutendexBook[]
}

const BASE = 'https://gutendex.com/books'

export const searchGutendexBooks = async (
  query: string,
  signal?: AbortSignal,
): Promise<GutendexBook[]> => {
  const trimmed = query.trim()
  if (!trimmed) return []
  const url = new URL(BASE)
  url.searchParams.set('search', trimmed)
  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`Gutendex search failed: ${res.status}`)
  const data: GutendexResponse = await res.json()
  return data.results ?? []
}

export const popularGutendexBooks = async (
  signal?: AbortSignal,
): Promise<GutendexBook[]> => {
  const url = new URL(BASE)
  url.searchParams.set('sort', 'popular')
  url.searchParams.set('languages', 'en')
  const res = await fetch(url.toString(), { signal })
  if (!res.ok) throw new Error(`Gutendex popular failed: ${res.status}`)
  const data: GutendexResponse = await res.json()
  return data.results ?? []
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
