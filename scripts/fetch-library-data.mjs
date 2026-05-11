#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUT_DIR = join(ROOT, 'public', 'library-data')

const CATEGORIES = ['fiction', 'mystery', 'children', 'history', 'philosophy', 'science']
const LANGUAGES = ['en', 'it', 'es', 'fr', 'de', 'pt', 'el']

const PAGES_PER_CATEGORY = 2
const PER_PAGE = 32
const KEEP_PER_BOOK = ['id', 'title', 'authors', 'languages', 'formats', 'download_count', 'subjects']
const REQUEST_TIMEOUT_MS = 90_000
const MAX_RETRIES = 3
const RETRY_BASE_DELAY_MS = 1_500
const BATCH_SIZE = 3

const BASE = 'https://gutendex.com/books/'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const slimBook = (book) => {
  const out = {}
  for (const key of KEEP_PER_BOOK) {
    if (book[key] !== undefined) out[key] = book[key]
  }
  if (out.formats) {
    const keep = {}
    for (const [mime, url] of Object.entries(out.formats)) {
      if (mime === 'image/jpeg' || mime.includes('epub')) keep[mime] = url
    }
    out.formats = keep
  }
  return out
}

const fetchPage = async (topic, lang, page) => {
  const params = new URLSearchParams({ topic, languages: lang, sort: 'popular' })
  if (page > 1) params.set('page', String(page))
  const url = `${BASE}?${params.toString()}`

  let lastError
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('timeout')), REQUEST_TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/json', 'User-Agent': 'toread.me-build/1.0' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (error) {
      lastError = error
      if (attempt < MAX_RETRIES) await sleep(RETRY_BASE_DELAY_MS * attempt)
    } finally {
      clearTimeout(timer)
    }
  }
  throw lastError ?? new Error('fetch failed')
}

const fetchCategory = async (topic, lang) => {
  const all = []
  let count = 0
  let hasMore = false

  for (let page = 1; page <= PAGES_PER_CATEGORY; page += 1) {
    const data = await fetchPage(topic, lang, page)
    if (page === 1) count = data.count ?? 0
    const results = Array.isArray(data.results) ? data.results : []
    all.push(...results.map(slimBook))
    hasMore = Boolean(data.next)
    if (!data.next) break
    if (results.length < PER_PAGE) break
  }

  return {
    topic,
    language: lang,
    count,
    hasMore,
    fetchedAt: new Date().toISOString(),
    results: all,
  }
}

const writeOutput = async (topic, lang, payload) => {
  const dir = join(OUT_DIR, lang)
  await mkdir(dir, { recursive: true })
  const path = join(dir, `${topic}.json`)
  await writeFile(path, JSON.stringify(payload), 'utf8')
  return path
}

const loadExisting = async (topic, lang) => {
  const path = join(OUT_DIR, lang, `${topic}.json`)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch {
    return null
  }
}

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true })
  const jobs = []
  for (const lang of LANGUAGES) {
    for (const topic of CATEGORIES) {
      jobs.push({ topic, lang })
    }
  }

  const results = { ok: 0, reused: 0, failed: 0 }
  const failures = []

  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    const batch = jobs.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async ({ topic, lang }) => {
        const label = `${lang}/${topic}`
        const start = Date.now()
        try {
          const payload = await fetchCategory(topic, lang)
          await writeOutput(topic, lang, payload)
          const elapsed = ((Date.now() - start) / 1000).toFixed(1)
          console.log(`[ok]     ${label.padEnd(14)} ${payload.results.length.toString().padStart(3)} books in ${elapsed}s`)
          results.ok += 1
        } catch (error) {
          const existing = await loadExisting(topic, lang)
          if (existing) {
            console.warn(`[reuse]  ${label.padEnd(14)} ${(error?.message ?? 'error')} → kept previous JSON`)
            results.reused += 1
          } else {
            const fallback = {
              topic,
              language: lang,
              count: 0,
              hasMore: false,
              fetchedAt: new Date().toISOString(),
              results: [],
              error: error?.message ?? 'fetch failed',
            }
            await writeOutput(topic, lang, fallback)
            console.error(`[fail]   ${label.padEnd(14)} ${error?.message ?? 'error'} → wrote empty JSON`)
            results.failed += 1
            failures.push(label)
          }
        }
      }),
    )
  }

  console.log('')
  console.log(`Library data: ok=${results.ok} reused=${results.reused} failed=${results.failed}`)
  if (failures.length) console.log(`Failed (empty stubs written): ${failures.join(', ')}`)
}

main().catch((error) => {
  console.error('fetch-library-data: fatal', error)
  process.exit(1)
})
