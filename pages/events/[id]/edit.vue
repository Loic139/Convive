<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
      <NuxtLink to="/dashboard" class="hover:text-terracotta">{{ $t('dashboard.title') }}</NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <NuxtLink :to="`/events/${eventId}`" class="hover:text-terracotta truncate max-w-[150px]">
        {{ event?.title ?? 'Repas' }}
      </NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">{{ $t('event.edit') }}</span>
    </nav>

    <div v-if="loadingEvent" class="card">
      <UiSkeleton height="h-6" width="w-1/2" class="mb-4" />
      <UiSkeleton height="h-10" width="w-full" class="mb-4" />
      <UiSkeleton height="h-24" width="w-full" />
    </div>

    <div v-else-if="event" class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ $t('event.edit') }}</h1>
      <p class="text-gray-500 text-sm mb-8">
        Les invités déjà inscrits seront notifiés des modifications de date ou d'heure.
      </p>

      <EventForm
        :initial="initialForm"
        :loading="saving"
        is-edit
        @submit="updateEvent"
        @cancel="navigateTo(`/events/${eventId}`)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Event, CreateEventPayload } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()

const eventId = route.params.id as string
const loadingEvent = ref(true)
const saving = ref(false)
const event = ref<Event | null>(null)

const initialForm = computed(() => {
  if (!event.value) return {}
  const d = new Date(event.value.date_time)
  return {
    title: event.value.title,
    description: event.value.description ?? '',
    date: d.toISOString().split('T')[0],
    time: d.toTimeString().slice(0, 5),
    max_seats: event.value.max_seats,
  }
})

async function loadEvent() {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('organizer_id', user.value!.id)
    .single()

  event.value = data
  loadingEvent.value = false
}

async function updateEvent(payload: CreateEventPayload) {
  saving.value = true
  try {
    const { error } = await $fetch(`/api/events/${eventId}/update`, {
      method: 'PUT',
      body: payload,
    })
    if (error) throw new Error(error)

    toast.success('Repas modifié !', 'Les invités ont été notifiés.')
    await navigateTo(`/events/${eventId}`)
  } catch (err) {
    toast.error('Erreur', (err as Error).message)
  } finally {
    saving.value = false
  }
}

onMounted(loadEvent)

useHead({ title: 'Modifier le repas — Convive' })
</script>
