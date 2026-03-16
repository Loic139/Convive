<template>
  <div class="max-w-2xl mx-auto px-4 sm:px-6 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
      <NuxtLink to="/dashboard" class="hover:text-terracotta transition-colors">
        {{ $t('dashboard.title') }}
      </NuxtLink>
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <span class="text-gray-900 font-medium">{{ $t('event.create') }}</span>
    </nav>

    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">🍽 {{ $t('event.create') }}</h1>
      <p class="text-gray-500 text-sm mb-8">
        Remplis les infos de ton repas. Un lien unique sera généré automatiquement.
      </p>

      <EventForm :loading="loading" @submit="createEvent" @cancel="navigateTo('/dashboard')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CreateEventPayload } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Créer un repas — Convive' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const { generateSlug } = useSlug()
const loading = ref(false)

async function createEvent(payload: CreateEventPayload) {
  loading.value = true
  try {
    const baseSlug = generateSlug(payload.title, payload.date_time)

    // Ensure slug uniqueness
    let slug = baseSlug
    let attempt = 0
    while (true) {
      const { data } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (!data) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        organizer_id: user.value!.id,
        title: payload.title,
        description: payload.description,
        date_time: payload.date_time,
        max_seats: payload.max_seats,
        slug,
      })
      .select()
      .single()

    if (error) throw error

    toast.success('Repas créé !', 'Partagez le lien avec vos amis.')
    await navigateTo(`/events/${data.id}`)
  } catch (err) {
    toast.error('Erreur', (err as Error).message)
  } finally {
    loading.value = false
  }
}
</script>
