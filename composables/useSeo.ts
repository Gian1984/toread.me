import { useHead, useSeoMeta } from '#imports'
import {
  DEFAULT_AUTHOR,
  DEFAULT_LOCALE,
  DEFAULT_THEME_COLOR,
  SITE_NAME,
  SITE_URL,
  pages,
  type PageRegistryEntry,
} from '~/utils/pagesRegistry'

const absoluteUrl = (path: string) => {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

const asJsonLd = (value: unknown) => JSON.stringify(value).replace(/</g, '\\u003c')

export function useSeo(key: PageRegistryEntry['key']): PageRegistryEntry {
  const page = pages[key]
  if (!page) {
    throw new Error(`Unknown SEO page key: ${key}`)
  }

  const canonical = absoluteUrl(page.seo.canonicalPath ?? page.path)
  const ogImage = absoluteUrl(page.seo.ogImage)
  const twitterImage = absoluteUrl(page.seo.twitterImage)

  useSeoMeta({
    title: page.seo.title,
    description: page.seo.description,
    keywords: page.seo.keywords.join(', '),
    robots: page.seo.robots,
    author: DEFAULT_AUTHOR,
    themeColor: DEFAULT_THEME_COLOR,
    ogTitle: page.seo.ogTitle,
    ogDescription: page.seo.ogDescription,
    ogType: page.seo.ogType,
    ogUrl: canonical,
    ogSiteName: SITE_NAME,
    ogImage,
    ogImageAlt: page.seo.imageAlt,
    ogLocale: DEFAULT_LOCALE,
    twitterCard: page.seo.twitterCard,
    twitterTitle: page.seo.twitterTitle,
    twitterDescription: page.seo.twitterDescription,
    twitterImage,
    twitterImageAlt: page.seo.imageAlt,
  })

  const breadcrumbSchema =
    page.breadcrumbs.length > 1
      ? {
          '@type': 'BreadcrumbList',
          itemListElement: page.breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: absoluteUrl(item.path),
          })),
        }
      : null

  const organizationSchema = {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl('/images/toread-logo.webp'),
    founder: {
      '@type': 'Person',
      name: DEFAULT_AUTHOR,
      url: 'https://gianlucatiengo.com/',
    },
    sameAs: ['https://codehelper.me/', 'https://www.unlistened.me/'],
  }

  const faqSchema = page.seo.faq?.length
    ? {
        '@type': 'FAQPage',
        mainEntity: page.seo.faq.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      }
    : null

  const pageStructuredData = Array.isArray(page.seo.structuredData)
    ? page.seo.structuredData
    : page.seo.structuredData
      ? [page.seo.structuredData]
      : []

  const graph = [
    organizationSchema,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...pageStructuredData,
    ...(faqSchema ? [faqSchema] : []),
  ]

  useHead({
    htmlAttrs: {
      lang: 'en',
    },
    link: [
      { rel: 'canonical', href: canonical },
      { rel: 'alternate', hreflang: 'en', href: canonical },
      { rel: 'alternate', hreflang: 'x-default', href: canonical },
    ],
    meta: [
      { name: 'application-name', content: SITE_NAME },
      { name: 'apple-mobile-web-app-title', content: SITE_NAME },
      { name: 'format-detection', content: 'telephone=no' },
    ],
    script: [
      {
        type: 'application/ld+json',
        key: `seo-jsonld-${key}`,
        innerHTML: asJsonLd({
          '@context': 'https://schema.org',
          '@graph': graph,
        }),
      },
    ],
  })

  return page
}
