<template>
  <div
    v-if="mounted && !decision"
    class="fixed inset-x-0 bottom-0 z-50 border-t border-gray-700 bg-gray-900 shadow-2xl"
  >
    <div class="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex-1 space-y-3">
        <p class="font-semibold text-white">Cookies and Privacy</p>
        <p class="text-sm text-gray-400">
          We use essential browser storage for reader preferences and, with your consent,
          analytics and advertising cookies.
          <NuxtLink to="/privacy/" class="ml-1 text-indigo-400 hover:underline">
            Privacy Policy
          </NuxtLink>
        </p>
        <div class="flex flex-wrap gap-6">
          <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-300">
            <input
              v-model="prefs.analytics"
              type="checkbox"
              class="size-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
            Analytics
          </label>
          <label class="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-300">
            <input
              v-model="prefs.ads"
              type="checkbox"
              class="size-4 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-gray-900"
            >
            Ads and Personalization
          </label>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap gap-2">
        <button
          class="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
          @click="rejectAll"
        >
          Reject all
        </button>
        <button
          class="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
          @click="save"
        >
          Save preferences
        </button>
        <button
          class="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition hover:bg-gray-700 hover:text-white"
          @click="acceptAll"
        >
          Accept all
        </button>
      </div>
    </div>
  </div>

  <button
    v-if="mounted && decision"
    class="fixed bottom-20 right-4 z-50 flex size-10 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400 shadow-lg transition-all duration-300 hover:bg-gray-700 hover:text-white sm:bottom-24"
    title="Change cookie preferences"
    aria-label="Change cookie preferences"
    @click="resetConsent"
  >
    <CookieIcon class="size-5" aria-hidden="true" />
  </button>
</template>

<script setup lang="ts">
import { defineComponent, h, onMounted, reactive, ref } from 'vue'

type ConsentPrefs = { analytics: boolean; ads: boolean }
type ConsentDecision = null | 'accepted' | 'rejected' | 'custom'
type ConsentState = { decision: ConsentDecision; prefs: ConsentPrefs }
type ConsentWindow = Window & {
  dataLayer?: unknown[]
  gtag?: (...args: unknown[]) => void
}

const STORAGE_KEY = 'cookieConsent.v1'

const CookieIcon = defineComponent({
  render: () =>
    h(
      'svg',
      {
        fill: 'none',
        viewBox: '0 0 24 24',
        stroke: 'currentColor',
        'stroke-width': '1.8',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      },
      [
        h('path', {
          d: 'M20.2 12.6a8.2 8.2 0 1 1-8.8-8.8 3.4 3.4 0 0 0 3.1 4.7 3.1 3.1 0 0 0 4.7 3.1 8 8 0 0 1 1 .9Z',
        }),
        h('path', { d: 'M8.2 8.7h.01' }),
        h('path', { d: 'M12.2 15.2h.01' }),
        h('path', { d: 'M7.8 15.8h.01' }),
        h('path', { d: 'M13.5 10.8h.01' }),
      ],
    ),
})

const mounted = ref(false)
const decision = ref<ConsentDecision>(null)
const prefs = reactive<ConsentPrefs>({ analytics: true, ads: false })

onMounted(() => {
  mounted.value = true

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const saved = JSON.parse(raw) as ConsentState
    if (saved?.prefs) Object.assign(prefs, saved.prefs)
    if (saved?.decision) {
      decision.value = saved.decision
      applyConsent(prefs)
    }
  } catch {
    // Invalid localStorage payloads should not block the app shell.
  }
})

function saveState(kind: ConsentDecision) {
  decision.value = kind
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ decision: kind, prefs }))
}

function acceptAll() {
  prefs.analytics = true
  prefs.ads = true
  applyConsent(prefs)
  saveState('accepted')
  pushChoiceEvent('accept_all')
}

function rejectAll() {
  prefs.analytics = false
  prefs.ads = false
  applyConsent(prefs)
  saveState('rejected')
  pushChoiceEvent('reject_all')
}

function save() {
  applyConsent(prefs)
  saveState('custom')
  pushChoiceEvent('custom')
}

function resetConsent() {
  decision.value = null
  localStorage.removeItem(STORAGE_KEY)
}

function applyConsent(p: ConsentPrefs) {
  if (typeof window === 'undefined') return

  const consentWindow = window as ConsentWindow
  const gtag = consentWindow.gtag || ((...args: unknown[]) => {
    consentWindow.dataLayer = consentWindow.dataLayer || []
    consentWindow.dataLayer.push(args)
  })

  gtag('consent', 'update', {
    analytics_storage: p.analytics ? 'granted' : 'denied',
    ad_storage: p.ads ? 'granted' : 'denied',
    ad_user_data: p.ads ? 'granted' : 'denied',
    ad_personalization: p.ads ? 'granted' : 'denied',
  })

  if (p.analytics) {
    const payload = {
      page_path: location.pathname + location.search + location.hash,
      page_location: location.href,
      page_title: document.title,
    }
    consentWindow.dataLayer?.push({ event: 'page_view', ...payload })
    gtag('event', 'page_view', payload)
  }
}

function pushChoiceEvent(action: 'accept_all' | 'reject_all' | 'custom') {
  if (typeof window === 'undefined') return

  const consentWindow = window as ConsentWindow
  consentWindow.dataLayer = consentWindow.dataLayer || []
  consentWindow.dataLayer.push({
    event: 'consent_choice',
    consent_action: action,
    consent_analytics: prefs.analytics,
    consent_ads: prefs.ads,
  })
}
</script>
