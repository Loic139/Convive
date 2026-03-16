<template>
  <div class="flex items-center gap-3">
    <div :class="['ring-2 rounded-2xl px-4 py-3 text-center min-w-[100px]', ringColor]">
      <div :class="['text-3xl font-bold tabular-nums', textColor]">
        {{ seatsRemaining }}
      </div>
      <div class="text-xs font-medium mt-0.5 opacity-70">
        {{ seatsRemaining <= 1 ? 'place restante' : 'places restantes' }}
      </div>
    </div>
    <div class="text-sm text-gray-500">
      sur {{ maxSeats }} au total
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  confirmedSeats: number
  maxSeats: number
}>()

const { getSeatsColor, getSeatsRingColor } = useEventStatus()

const seatsRemaining = computed(() => props.maxSeats - props.confirmedSeats)
const textColor = computed(() => getSeatsColor(seatsRemaining.value, props.maxSeats))
const ringColor = computed(() => getSeatsRingColor(seatsRemaining.value, props.maxSeats))
</script>
