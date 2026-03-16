<template>
  <div :class="['flex items-start gap-3 p-4 rounded-xl shadow-lg border max-w-sm w-full', variantClasses]">
    <span class="text-lg flex-shrink-0">{{ icon }}</span>
    <div class="flex-1 min-w-0">
      <p class="font-medium text-sm">{{ title }}</p>
      <p v-if="message" class="text-xs mt-0.5 opacity-75">{{ message }}</p>
    </div>
    <button type="button" class="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0" @click="$emit('close')">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ToastType = 'success' | 'error' | 'info' | 'warning'

const props = defineProps<{
  type?: ToastType
  title: string
  message?: string
}>()

defineEmits<{ close: [] }>()

const icons: Record<ToastType, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
}

const variantClassesMap: Record<ToastType, string> = {
  success: 'bg-white border-sage-100 text-gray-900',
  error: 'bg-white border-red-100 text-gray-900',
  info: 'bg-white border-blue-100 text-gray-900',
  warning: 'bg-white border-orange-100 text-gray-900',
}

const icon = computed(() => icons[props.type ?? 'info'])
const variantClasses = computed(() => variantClassesMap[props.type ?? 'info'])
</script>
