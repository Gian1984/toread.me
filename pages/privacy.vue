<script setup lang="ts">
useSeo('privacy')
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-white">
    <section class="mx-auto max-w-3xl px-6 py-16 lg:px-8">
      <nav class="mb-10 flex items-center gap-2 text-sm text-gray-400" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-indigo-300">Home</NuxtLink>
        <span>/</span>
        <span class="text-gray-200">Privacy</span>
      </nav>

      <div>
        <h1 class="text-4xl font-bold text-white">Privacy Policy</h1>
        <p class="mt-3 text-sm text-gray-400">Last updated: April 2026</p>
      </div>

      <div class="mt-10 space-y-10">
        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Overview</h2>
          <p class="leading-relaxed text-gray-300">
            toread.me is a privacy-minded ebook reader. The core reader works in your browser,
            and local EPUB files are opened locally through browser APIs. This policy explains
            what data is used, what stays on your device, and which third-party services may be contacted.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Data We Do Not Collect</h2>
          <ul class="space-y-2 leading-relaxed text-gray-300">
            <li class="flex gap-2"><span class="shrink-0 text-indigo-400">•</span> We do not require accounts or registration.</li>
            <li class="flex gap-2"><span class="shrink-0 text-indigo-400">•</span> Local EPUB files you open are not uploaded to our server.</li>
            <li class="flex gap-2"><span class="shrink-0 text-indigo-400">•</span> Reading settings and consent choices are stored in your browser when needed.</li>
            <li class="flex gap-2"><span class="shrink-0 text-indigo-400">•</span> We do not sell or rent personal data.</li>
          </ul>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Browser Storage</h2>
          <p class="leading-relaxed text-gray-300">
            toread.me uses browser storage for preferences that improve the reading experience.
          </p>
          <div class="space-y-3">
            <div class="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <p class="text-sm font-semibold text-white">Essential storage</p>
              <p class="mt-1 text-sm text-gray-400">
                Cookie consent preferences are stored under
                <code class="text-indigo-400">cookieConsent.v1</code>. Reader preferences may be stored locally
                as the product evolves. These values stay in your browser.
              </p>
            </div>
            <div class="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <p class="text-sm font-semibold text-white">Local EPUB files</p>
              <p class="mt-1 text-sm text-gray-400">
                Dragged or selected EPUB files are opened through temporary browser object URLs.
                The file remains on your device and is not sent to a backend by toread.me.
              </p>
            </div>
            <div class="rounded-lg border border-gray-700 bg-gray-900 p-4">
              <p class="text-sm font-semibold text-white">Analytics and ads</p>
              <p class="mt-1 text-sm text-gray-400">
                The cookie banner prepares analytics and ads preferences for a future Tag Manager setup.
                Tag Manager is not currently loaded by the app unless it is added separately.
              </p>
            </div>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Third-Party Services</h2>
          <div class="space-y-3 leading-relaxed text-gray-300">
            <p>
              <strong class="text-white">Gutendex.</strong>
              The search and popular books sections call Gutendex to discover public-domain Project Gutenberg books.
              Search terms entered in the Gutenberg search field are sent to Gutendex.
            </p>
            <p>
              <strong class="text-white">Project Gutenberg.</strong>
              Bundled or linked public-domain EPUBs may originate from Project Gutenberg.
              Some remote EPUBs cannot be opened directly inside the static reader because of browser CORS restrictions.
            </p>
            <p>
              <strong class="text-white">Google Tag Manager and Analytics.</strong>
              The app includes a consent component compatible with these services, but the Tag Manager script is not currently loaded.
              If added later, analytics will be controlled by the consent choices.
            </p>
          </div>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Your Choices</h2>
          <p class="leading-relaxed text-gray-300">
            You can change or withdraw cookie preferences at any time by clicking the settings icon
            shown after a consent decision. You can also clear browser storage from your browser settings.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Related Projects</h2>
          <p class="leading-relaxed text-gray-300">
            toread.me is part of a wider cultural project with
            <a href="https://codehelper.me/" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">CodeHelper</a>
            and
            <a href="https://www.unlistened.me/" target="_blank" rel="noopener" class="text-indigo-300 hover:underline">Unlistened.me</a>.
            Each site has its own product scope and privacy considerations.
          </p>
        </section>

        <section class="space-y-4">
          <h2 class="text-xl font-semibold text-white">Changes to This Policy</h2>
          <p class="leading-relaxed text-gray-300">
            This policy may change as toread.me evolves. The date at the top reflects the most recent revision.
          </p>
        </section>
      </div>
    </section>
  </div>
</template>
