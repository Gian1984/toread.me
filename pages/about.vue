<script setup lang="ts">
import {
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  CodeBracketIcon,
  MusicalNoteIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/vue/24/outline'

useSeo('about')

const projects = [
  {
    name: 'toread.me',
    href: '/',
    logo: '/images/toread-logo.webp',
    label: 'Private ebook reader',
    description:
      'A focused reading workspace for public-domain books and local EPUB files, built around quiet typography, reader controls, and browser-first privacy.',
    icon: BookOpenIcon,
  },
  {
    name: 'CodeHelper',
    href: 'https://codehelper.me/',
    logo: '/images/partners/codehelper-logo.webp',
    label: 'Free developer knowledge',
    description:
      'A collection of developer tools, learning resources, courses, reviews, and practical references designed to help people build and learn without friction.',
    icon: CodeBracketIcon,
  },
  {
    name: 'Unlistened.me',
    href: 'https://www.unlistened.me/',
    logo: '/images/partners/unlistened-logo.png',
    label: 'Audio discovery',
    description:
      'A listening platform for podcasts and free music discovery, created to make learning, independent voices, and open audio culture easier to explore.',
    icon: MusicalNoteIcon,
  },
]

const principles = [
  {
    title: 'Free access to culture',
    description:
      'The three projects share the same direction: make useful knowledge, books, audio, and developer resources easier to reach without unnecessary barriers.',
    icon: SparklesIcon,
  },
  {
    title: 'Privacy by default',
    description:
      'toread.me keeps personal EPUB files in the browser session and avoids account requirements. The reader is designed to work with minimal data collection.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Focused tools',
    description:
      'Each site has a specific purpose: reading, coding, or listening. The common idea is to reduce noise and help people return to culture with less friction.',
    icon: BookOpenIcon,
  },
]
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <section class="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <nav class="mb-10 flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-indigo-300">Home</NuxtLink>
        <span>/</span>
        <span class="text-gray-200">About</span>
      </nav>

      <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
        <div>
          <p class="text-sm font-semibold uppercase tracking-wide text-indigo-400">About toread.me</p>
          <h1 class="mt-4 max-w-4xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            A quieter way to return to books.
          </h1>
          <p class="mt-6 max-w-3xl text-lg leading-8 text-gray-300">
            toread.me is an ebook reader focused on public-domain books, local EPUB files,
            and a reading experience that stays calm, private, and practical.
          </p>
          <p class="mt-4 max-w-3xl text-base leading-7 text-gray-400">
            It belongs to the same cultural direction as
            <a href="https://codehelper.me/" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">CodeHelper</a>
            and
            <a href="https://www.unlistened.me/" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">Unlistened.me</a>:
            a set of independent projects built to support free access to culture, learning,
            tools, books, and audio.
          </p>
        </div>

        <div class="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-8">
          <img
            src="/images/toread-logo.webp"
            alt="toread.me logo"
            class="mx-auto size-40 rounded-full"
          >
          <p class="mt-6 text-center text-sm font-semibold uppercase tracking-wide text-indigo-300">
            Reader first
          </p>
          <p class="mt-2 text-center text-sm leading-6 text-gray-300">
            Public-domain discovery, local EPUB reading, and typography controls in one focused workspace.
          </p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
      <div class="rounded-2xl border border-gray-800 bg-gray-900/70 p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-white">Part of a wider cultural project</h2>
        <p class="mt-3 max-w-3xl text-sm leading-6 text-gray-400">
          These projects are separate products, but they share a common purpose:
          making free culture and practical knowledge easier to discover, use, and revisit.
        </p>

        <div class="mt-8 grid gap-4 lg:grid-cols-3">
          <article
            v-for="project in projects"
            :key="project.name"
            class="rounded-xl border border-gray-800 bg-gray-950/70 p-5 transition-colors hover:border-indigo-500/50"
          >
            <div class="flex items-center gap-4">
              <img
                :src="project.logo"
                :alt="`${project.name} logo`"
                class="size-14 rounded-xl object-contain"
              >
              <div>
                <h3 class="text-lg font-bold text-white">{{ project.name }}</h3>
                <p class="text-xs font-semibold uppercase tracking-wide text-indigo-300">{{ project.label }}</p>
              </div>
            </div>
            <p class="mt-4 text-sm leading-6 text-gray-400">{{ project.description }}</p>
            <a
              :href="project.href"
              :target="project.href.startsWith('http') ? '_blank' : undefined"
              :rel="project.href.startsWith('http') ? 'noopener' : undefined"
              class="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Visit project
              <ArrowTopRightOnSquareIcon v-if="project.href.startsWith('http')" class="size-4" aria-hidden="true" />
            </a>
          </article>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-12 lg:px-8">
      <div class="grid gap-4 md:grid-cols-3">
        <article
          v-for="principle in principles"
          :key="principle.title"
          class="rounded-xl border border-gray-800 bg-gray-900/70 p-6"
        >
          <div class="flex size-11 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/30">
            <component :is="principle.icon" class="size-5" aria-hidden="true" />
          </div>
          <h2 class="mt-5 text-lg font-bold text-white">{{ principle.title }}</h2>
          <p class="mt-3 text-sm leading-6 text-gray-400">{{ principle.description }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
      <div class="rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-6 sm:p-8">
        <h2 class="text-2xl font-bold text-white">About the creator</h2>
        <p class="mt-4 max-w-3xl text-base leading-7 text-gray-300">
          toread.me, CodeHelper, and Unlistened.me are projects by
          <a href="https://gianlucatiengo.com/" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">Gianluca Tiengo</a>.
          The shared goal is to build small, useful, privacy-minded web experiences that help people learn,
          read, listen, and create.
        </p>
      </div>
    </section>
  </div>
</template>
