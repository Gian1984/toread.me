export const SITE_URL = 'https://toread.me'
export const SITE_NAME = 'toread.me'
export const DEFAULT_LOCALE = 'en_US'
export const DEFAULT_AUTHOR = 'Gianluca Tiengo'
export const DEFAULT_THEME_COLOR = '#111827'

export type SitemapChangefreq = 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'

export type FaqItem = {
  question: string
  answer: string
}

export type BreadcrumbItem = {
  name: string
  path: string
}

export type SocialImageSet = {
  og: string
  twitter: string
  square?: string
}

export type PageSeo = {
  title: string
  titleTemplate?: string
  description: string
  keywords: string[]
  robots: string
  canonicalPath?: string
  ogTitle: string
  ogDescription: string
  ogType: 'website' | 'article' | 'profile'
  ogImage: string
  twitterTitle: string
  twitterDescription: string
  twitterCard: 'summary' | 'summary_large_image'
  twitterImage: string
  imageAlt: string
  structuredData?: Record<string, unknown> | Record<string, unknown>[]
  faq?: FaqItem[]
}

export type PageRegistryEntry = {
  key: 'home' | 'library' | 'about' | 'privacy'
  label: string
  path: string
  summary: string
  socialImages: SocialImageSet
  sitemap: {
    priority: number
    changefreq: SitemapChangefreq
  }
  breadcrumbs: BreadcrumbItem[]
  seo: PageSeo
}

export const socialImages = {
  home: {
    og: '/images/social/home-og.png',
    twitter: '/images/social/home-twitter.png',
    square: '/images/social/home-square.png',
  },
  about: {
    og: '/images/social/about-og.png',
    twitter: '/images/social/about-twitter.png',
    square: '/images/social/about-square.png',
  },
  library: {
    og: '/images/social/library-og.png',
    twitter: '/images/social/library-twitter.png',
    square: '/images/social/library-square.png',
  },
  privacy: {
    og: '/images/social/privacy-og.png',
    twitter: '/images/social/privacy-twitter.png',
    square: '/images/social/privacy-square.png',
  },
} satisfies Record<string, SocialImageSet>

export const pages: Record<PageRegistryEntry['key'], PageRegistryEntry> = {
  home: {
    key: 'home',
    label: 'Reader',
    path: '/',
    summary: 'A privacy-minded EPUB reader for public-domain books and local files.',
    socialImages: socialImages.home,
    sitemap: { priority: 1, changefreq: 'weekly' },
    breadcrumbs: [{ name: 'Home', path: '/' }],
    seo: {
      title: 'toread.me | Free Private EPUB Reader for Public-Domain Books',
      description:
        'Read public-domain books and local EPUB files in a focused, privacy-minded browser reader with day/night themes, typography controls, and Gutenberg discovery.',
      keywords: [
        'ebook reader',
        'epub reader',
        'online epub reader',
        'private ebook reader',
        'Project Gutenberg reader',
        'public domain books',
        'local epub reader',
        'browser ebook reader',
      ],
      robots: 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1',
      ogTitle: 'toread.me | Private EPUB Reader',
      ogDescription:
        'A focused browser reader for public-domain books and local EPUB files, built around privacy, typography, and calm reading.',
      ogType: 'website',
      ogImage: socialImages.home.og,
      twitterTitle: 'toread.me | Private EPUB Reader',
      twitterDescription: 'Read public-domain books and local EPUB files in a focused browser reader.',
      twitterCard: 'summary_large_image',
      twitterImage: socialImages.home.twitter,
      imageAlt: 'toread.me logo on a blue social preview background',
      structuredData: [
        {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          inLanguage: 'en',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${SITE_URL}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'WebApplication',
          name: SITE_NAME,
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          url: SITE_URL,
          description:
            'A browser-based EPUB reader for public-domain books and local ebook files.',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
      faq: [
        {
          question: 'Can I read local EPUB files with toread.me?',
          answer:
            'Yes. You can open or drag and drop an EPUB file. The file is opened locally in your browser session and is not uploaded by toread.me.',
        },
        {
          question: 'Does toread.me include a test book?',
          answer:
            'Yes. The site includes Pride and Prejudice by Jane Austen from Project Gutenberg as a bundled public-domain EPUB.',
        },
        {
          question: 'Why do some Gutenberg books not open directly?',
          answer:
            'Some remote EPUB files are blocked by browser CORS rules. toread.me shows a source link instead of leaving the reader in an endless loading state.',
        },
      ],
    },
  },
  library: {
    key: 'library',
    label: 'Library',
    path: '/library/',
    summary: 'Browse Project Gutenberg books by category and language.',
    socialImages: socialImages.library,
    sitemap: { priority: 0.9, changefreq: 'daily' },
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Library', path: '/library/' },
    ],
    seo: {
      title: 'Library | Browse Free Public-Domain EPUB Books | toread.me',
      description:
        'Browse public-domain books from Project Gutenberg by category and language, then open EPUB files in the toread.me browser reader.',
      keywords: [
        'free ebook library',
        'Project Gutenberg books',
        'public domain library',
        'free epub books',
        'classic books online',
        'multilingual ebooks',
        'Gutendex library',
      ],
      robots: 'index,follow,max-image-preview:large,max-snippet:-1',
      ogTitle: 'toread.me Library',
      ogDescription:
        'Browse free public-domain books by category and language from Project Gutenberg.',
      ogType: 'website',
      ogImage: socialImages.library.og,
      twitterTitle: 'toread.me Library',
      twitterDescription: 'Browse Project Gutenberg books by category and language.',
      twitterCard: 'summary_large_image',
      twitterImage: socialImages.library.twitter,
      imageAlt: 'toread.me Library social preview with logo and blue background',
      structuredData: {
        '@type': 'CollectionPage',
        name: 'toread.me Library',
        url: `${SITE_URL}/library/`,
        description:
          'A browsable collection page for public-domain books from Project Gutenberg.',
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      faq: [
        {
          question: 'Can I filter the library by language?',
          answer:
            'Yes. The library can filter Project Gutenberg results by common European languages including English, Italian, Spanish, French, German, Portuguese and Greek.',
        },
        {
          question: 'Where do library books come from?',
          answer:
            'The library uses Gutendex metadata for Project Gutenberg public-domain books.',
        },
      ],
    },
  },
  about: {
    key: 'about',
    label: 'About',
    path: '/about/',
    summary: 'About toread.me and the free-culture project around CodeHelper and Unlistened.me.',
    socialImages: socialImages.about,
    sitemap: { priority: 0.8, changefreq: 'monthly' },
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'About', path: '/about/' },
    ],
    seo: {
      title: 'About toread.me | Free Culture, Books, Code and Audio',
      description:
        'Learn about toread.me and its connection with CodeHelper and Unlistened.me, three independent projects for free access to culture, books, developer knowledge and audio.',
      keywords: [
        'about toread.me',
        'free culture project',
        'CodeHelper',
        'Unlistened.me',
        'public domain books',
        'open culture',
        'Gianluca Tiengo',
      ],
      robots: 'index,follow,max-image-preview:large',
      ogTitle: 'About toread.me',
      ogDescription:
        'toread.me is part of a wider free-culture project with CodeHelper and Unlistened.me.',
      ogType: 'website',
      ogImage: socialImages.about.og,
      twitterTitle: 'About toread.me',
      twitterDescription: 'Books, code and audio as part of a wider free-culture project.',
      twitterCard: 'summary_large_image',
      twitterImage: socialImages.about.twitter,
      imageAlt: 'About toread.me social preview with logo and blue background',
      structuredData: {
        '@type': 'AboutPage',
        name: 'About toread.me',
        url: `${SITE_URL}/about/`,
        description:
          'About toread.me and the related free-culture projects CodeHelper and Unlistened.me.',
      },
      faq: [
        {
          question: 'What is toread.me?',
          answer:
            'toread.me is a focused browser ebook reader for public-domain books and local EPUB files.',
        },
        {
          question: 'How is toread.me related to CodeHelper and Unlistened.me?',
          answer:
            'They are independent projects by Gianluca Tiengo with a shared direction: making culture, learning, tools and audio easier to access for free.',
        },
      ],
    },
  },
  privacy: {
    key: 'privacy',
    label: 'Privacy Policy',
    path: '/privacy/',
    summary: 'How toread.me handles local files, browser storage, Gutendex, and consent.',
    socialImages: socialImages.privacy,
    sitemap: { priority: 0.4, changefreq: 'monthly' },
    breadcrumbs: [
      { name: 'Home', path: '/' },
      { name: 'Privacy Policy', path: '/privacy/' },
    ],
    seo: {
      title: 'Privacy Policy | toread.me',
      description:
        'Privacy policy for toread.me: local EPUB files stay in your browser, consent choices are stored locally, and Gutenberg discovery uses Gutendex.',
      keywords: [
        'toread.me privacy',
        'epub reader privacy',
        'local epub files',
        'browser storage',
        'cookie consent',
        'Gutendex privacy',
      ],
      robots: 'index,follow',
      ogTitle: 'Privacy Policy | toread.me',
      ogDescription:
        'How toread.me handles local EPUB reading, browser storage, Gutendex and future analytics consent.',
      ogType: 'website',
      ogImage: socialImages.privacy.og,
      twitterTitle: 'Privacy Policy | toread.me',
      twitterDescription: 'Local EPUB handling, browser storage, Gutendex and consent details.',
      twitterCard: 'summary_large_image',
      twitterImage: socialImages.privacy.twitter,
      imageAlt: 'Privacy Policy social preview for toread.me',
      structuredData: {
        '@type': 'WebPage',
        name: 'Privacy Policy',
        url: `${SITE_URL}/privacy/`,
        isPartOf: {
          '@type': 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
        },
      },
      faq: [
        {
          question: 'Are local EPUB files uploaded to toread.me?',
          answer:
            'No. Local EPUB files are opened through browser APIs and are not uploaded to a backend by toread.me.',
        },
        {
          question: 'Does toread.me use analytics?',
          answer:
            'The app includes a consent component compatible with analytics, but Tag Manager is not loaded unless it is added separately.',
        },
      ],
    },
  },
}

export const pageRoutes = Object.values(pages).map((page) => page.path)
