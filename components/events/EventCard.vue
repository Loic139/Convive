<template>
  <NuxtLink :to="`/events/${event.id}`" class="card-hover block group">
    <div class="flex items-start justify-between gap-3 mb-3">
      <h3 class="font-semibold text-gray-900 group-hover:text-terracotta transition-colors line-clamp-2">
        {{ event.title }}
      </h3>
      <UiBadge :variant="event.status" dot class="flex-shrink-0">
        {{ $t(`event.status.${event.status}`) }}
      </UiBadge>
    </div>

    <div class="flex items-center gap-2 text-sm text-gray-500 mb-4">
      <svg class="w-4 h-4 text-terracotta flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span class="capitalize">{{ formatDate(event.date_time) }}</span>
      <span>·</span>
      <span>{{ formatTime(event.date_time) }}</span>
    </div>

    <!-- Seats progress -->
    <div class="space-y-2">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500">
          {{ $t('event.seats_used', { used: confirmedSeats, total: event.max_seats }, confirmedSeats) }}
        </span>
        <span :class="['font-semibold', seatsColor]">
          <template v-if="seatsRemaining > 0">
            {{ $t('event.seats_remaining', { count: seatsRemaining }, seatsRemaining) }}
          </template>
          <template v-else>
            {{ $t('event.full') }}
          </template>
        </span>
      </div>
      <div class="h-1.5 bg-beige-dark rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all duration-500"
          :class="progressColor"
          :style="{ width: `${progressWidth}%` }"
        />
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Event } from '~/types'

const props = defineProps<{
  event: Event
}>()

const { formatDate, formatTime, getSeatsColor } = useEventStatus()

const confirmedSeats = computed(() => props.event.confirmed_seats ?? 0)
const seatsRemaining = computed(() => props.event.max_seats - confirmedSeats.value)
const seatsColor = computed(() => getSeatsColor(seatsRemaining.value, props.event.max_seats))

const progressWidth = computed(() =>
  Math.min(100, (confirmedSeats.value / props.event.max_seats) * 100),
)

const progressColor = computed(() => {
  if (seatsRemaining.value === 0) return 'bg-red-400'
  const ratio = seatsRemaining.value / props.event.max_seats
  if (ratio <= 0.2) return 'bg-orange-400'
  return 'bg-sage'
})
</script>
