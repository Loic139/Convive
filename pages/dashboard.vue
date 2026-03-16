<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-10">
    <!-- Header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ $t('dashboard.title') }}</h1>
        <p class="text-gray-500 mt-1">{{ $t('dashboard.subtitle') }}</p>
      </div>
      <NuxtLink to="/events/new" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('nav.create_event') }}
      </NuxtLink>
    </div>

    <!-- Filters -->
    <div class="flex gap-2 mb-6">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="['px-4 py-2 rounded-xl text-sm font-medium transition-colors', activeTab === tab.value ? 'bg-terracotta text-white' : 'bg-white text-gray-600 hover:bg-beige border border-beige-dark']"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span v-if="tab.count > 0" :class="['ml-1.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === tab.value ? 'bg-white/20' : 'bg-beige-dark']">
          {{ tab.count }}
        </span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="i in 6" :key="i" class="card">
        <UiSkeleton height="h-5" width="w-3/4" class="mb-3" />
        <UiSkeleton height="h-4" width="w-1/2" class="mb-5" />
        <UiSkeleton height="h-2" width="w-full" />
      </div>
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredEvents.length === 0" class="text-center py-20">
      <div class="text-5xl mb-4">🍽</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ $t('dashboard.empty') }}</h3>
      <p class="text-gray-500 mb-6">{{ $t('dashboard.empty_desc') }}</p>
      <NuxtLink to="/events/new" class="btn-primary">
        {{ $t('dashboard.create_first') }}
      </NuxtLink>
    </div>

    <!-- Events grid -->
    <div v-else class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <EventCard v-for="event in filteredEvents" :key="event.id" :event="event" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Event } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Mes repas — Convive' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(true)
const events = ref<Event[]>([])
const activeTab = ref('upcoming')

const tabs = computed(() => [
  { value: 'upcoming', label: 'À venir', count: upcomingEvents.value.length },
  { value: 'past', label: 'Passés', count: pastEvents.value.length },
  { value: 'all', label: 'Tous', count: events.value.length },
])

const upcomingEvents = computed(() =>
  events.value.filter((e) => e.status !== 'archived' && e.status !== 'cancelled'),
)

const pastEvents = computed(() =>
  events.value.filter((e) => e.status === 'archived' || e.status === 'cancelled'),
)

const filteredEvents = computed(() => {
  if (activeTab.value === 'upcoming') return upcomingEvents.value
  if (activeTab.value === 'past') return pastEvents.value
  return events.value
})

async function loadEvents() {
  loading.value = true
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      reservations(count)
    `)
    .eq('organizer_id', user.value!.id)
    .order('date_time', { ascending: false })

  if (!error && data) {
    events.value = data.map((e) => ({
      ...e,
      confirmed_seats: (e.reservations as { count: number }[])?.[0]?.count ?? 0,
    }))
  }
  loading.value = false
}

onMounted(loadEvents)
</script>
