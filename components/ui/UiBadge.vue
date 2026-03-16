<template>
  <span :class="classes">
    <span v-if="dot" class="w-1.5 h-1.5 rounded-full" :class="dotClass" />
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Variant = 'active' | 'full' | 'cancelled' | 'archived' | 'info'

const props = defineProps<{
  variant?: Variant
  dot?: boolean
}>()

const variantMap: Record<Variant, { badge: string; dot: string }> = {
  active: { badge: 'badge-active', dot: 'bg-sage' },
  full: { badge: 'badge-full', dot: 'bg-orange-500' },
  cancelled: { badge: 'badge-cancelled', dot: 'bg-red-500' },
  archived: { badge: 'badge-archived', dot: 'bg-gray-400' },
  info: { badge: 'badge bg-blue-50 text-blue-700 border border-blue-100', dot: 'bg-blue-500' },
}

const current = computed(() => variantMap[props.variant ?? 'active'])
const classes = computed(() => current.value.badge)
const dotClass = computed(() => current.value.dot)
</script>
