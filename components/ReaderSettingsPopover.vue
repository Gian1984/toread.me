<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue'
import { Cog6ToothIcon, MoonIcon, SunIcon } from '@heroicons/vue/24/outline'

type Typeface = { label: string; value: string; stack: string }

defineProps<{
  mode: 'day' | 'night'
  warmth: number
  fontSize: number
  lineHeight: number
  isBoldText: boolean
  selectedTypeface: string
  typefaces: ReadonlyArray<Typeface>
  triggerClass?: string | string[]
  panelClass?: string
}>()

const emit = defineEmits<{
  'update:mode': ['day' | 'night']
  'update:warmth': [number]
  'update:fontSize': [number]
  'update:lineHeight': [number]
  'update:isBoldText': [boolean]
  'update:selectedTypeface': [string]
}>()
</script>

<template>
  <Popover v-slot="{ open }" class="relative">
    <PopoverButton
      :class="[
        triggerClass ?? 'inline-flex rounded-md p-2 text-gray-200 transition-colors hover:bg-gray-800 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400',
        open && !triggerClass ? 'bg-gray-800 text-white' : '',
      ]"
      aria-label="Reader settings"
      title="Reader settings"
    >
      <Cog6ToothIcon class="size-5" aria-hidden="true" />
    </PopoverButton>
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
        :class="panelClass ?? 'absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-2xl'"
      >
        <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Theme</p>
        <div class="mt-2 grid grid-cols-2 overflow-hidden rounded-md border border-gray-700">
          <button
            type="button"
            class="flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold transition-colors"
            :class="mode === 'day' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
            @click="emit('update:mode', 'day')"
          >
            <SunIcon class="size-4" aria-hidden="true" />
            Day
          </button>
          <button
            type="button"
            class="flex items-center justify-center gap-1 px-3 py-2 text-sm font-semibold transition-colors"
            :class="mode === 'night' ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-800'"
            @click="emit('update:mode', 'night')"
          >
            <MoonIcon class="size-4" aria-hidden="true" />
            Night
          </button>
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between">
            <label for="warmth" class="text-xs font-semibold uppercase tracking-wide text-gray-400">Paper tone</label>
            <span class="text-xs font-semibold text-gray-300">{{ mode === 'day' ? `${warmth}% warm` : 'Locked' }}</span>
          </div>
          <input
            id="warmth"
            :value="warmth"
            :disabled="mode === 'night'"
            type="range"
            min="0"
            max="100"
            class="mt-2 w-full accent-indigo-500 disabled:opacity-40"
            @input="emit('update:warmth', Number(($event.target as HTMLInputElement).value))"
          >
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between">
            <label for="font-size" class="text-xs font-semibold uppercase tracking-wide text-gray-400">Font size</label>
            <span class="text-xs font-semibold text-gray-300">{{ fontSize }}px</span>
          </div>
          <input
            id="font-size"
            :value="fontSize"
            type="range"
            min="14"
            max="28"
            class="mt-2 w-full accent-indigo-500"
            @input="emit('update:fontSize', Number(($event.target as HTMLInputElement).value))"
          >
        </div>

        <div class="mt-4">
          <div class="flex items-center justify-between">
            <label for="line-height" class="text-xs font-semibold uppercase tracking-wide text-gray-400">Line height</label>
            <span class="text-xs font-semibold text-gray-300">{{ lineHeight.toFixed(2) }}</span>
          </div>
          <input
            id="line-height"
            :value="lineHeight"
            type="range"
            min="1.2"
            max="2.4"
            step="0.05"
            class="mt-2 w-full accent-indigo-500"
            @input="emit('update:lineHeight', Number(($event.target as HTMLInputElement).value))"
          >
        </div>

        <div class="mt-4">
          <label for="typeface" class="text-xs font-semibold uppercase tracking-wide text-gray-400">Typeface</label>
          <select
            id="typeface"
            :value="selectedTypeface"
            class="mt-2 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
            @change="emit('update:selectedTypeface', ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="t in typefaces" :key="t.value" :value="t.value">{{ t.label }}</option>
          </select>
        </div>

        <label class="mt-4 flex items-center justify-between gap-3 rounded-md border border-gray-700 bg-gray-800/60 px-3 py-2">
          <span>
            <span class="block text-xs font-semibold uppercase tracking-wide text-gray-400">Bold text</span>
            <span class="mt-0.5 block text-xs text-gray-300">{{ isBoldText ? 'Enabled' : 'Disabled' }}</span>
          </span>
          <input
            :checked="isBoldText"
            type="checkbox"
            class="size-5 rounded border-gray-600 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
            @change="emit('update:isBoldText', ($event.target as HTMLInputElement).checked)"
          >
        </label>
      </PopoverPanel>
    </transition>
  </Popover>
</template>
