<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-10">
    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <UiSkeleton height="h-8" width="w-1/2" />
      <UiSkeleton height="h-4" width="w-1/3" />
      <div class="grid sm:grid-cols-3 gap-5">
        <UiSkeleton height="h-32" v-for="i in 3" :key="i" />
      </div>
    </div>

    <!-- Not found -->
    <div v-else-if="!event" class="text-center py-20">
      <div class="text-5xl mb-4">🔍</div>
      <h3 class="text-lg font-semibold">Repas introuvable</h3>
      <p class="text-gray-500 mt-2 mb-6">Ce repas n'existe pas ou a été supprimé.</p>
      <NuxtLink to="/dashboard" class="btn-primary">Retour au dashboard</NuxtLink>
    </div>

    <template v-else>
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <NuxtLink to="/dashboard" class="hover:text-terracotta transition-colors">
          {{ $t('dashboard.title') }}
        </NuxtLink>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="text-gray-900 font-medium truncate max-w-[200px]">{{ event.title }}</span>
      </nav>

      <div class="grid lg:grid-cols-3 gap-6">
        <!-- Main content -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Event header card -->
          <div class="card">
            <div class="flex items-start justify-between gap-3 mb-4">
              <h1 class="text-2xl font-bold text-gray-900">{{ event.title }}</h1>
              <UiBadge :variant="event.status" dot class="flex-shrink-0">
                {{ $t(`event.status.${event.status}`) }}
              </UiBadge>
            </div>

            <div v-if="event.description" class="text-gray-600 text-sm mb-5 whitespace-pre-wrap">
              {{ event.description }}
            </div>

            <div class="flex flex-wrap gap-4 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <svg class="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="capitalize font-medium">{{ formatDate(event.date_time) }}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-600">
                <svg class="w-4 h-4 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="font-medium">{{ formatTime(event.date_time) }}</span>
              </div>
            </div>
          </div>

          <!-- Seats card -->
          <div class="card">
            <h2 class="font-semibold text-gray-900 mb-4">Places</h2>
            <SeatIndicator :confirmed-seats="confirmedSeats" :max-seats="event.max_seats" />
          </div>

          <!-- Guests list -->
          <div class="card">
            <h2 class="font-semibold text-gray-900 mb-4">
              {{ $t('event.guests') }}
              <span class="text-gray-400 font-normal ml-1">({{ reservations.length }})</span>
            </h2>

            <div v-if="reservations.length === 0" class="text-sm text-gray-400 py-4 text-center">
              {{ $t('event.no_guests') }}
            </div>

            <ul v-else class="space-y-3">
              <li
                v-for="res in reservations"
                :key="res.id"
                class="flex items-start gap-3"
              >
                <div class="w-9 h-9 avatar text-sm flex-shrink-0 mt-0.5">
                  {{ getInitials(res.user?.full_name || res.user?.email || '?') }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">
                    {{ res.user?.full_name || 'Utilisateur' }}
                  </p>
                  <p class="text-xs text-gray-400 truncate">{{ res.user?.email }}</p>
                  <!-- Extras -->
                  <div class="flex flex-wrap gap-1.5 mt-1.5">
                    <span
                      class="badge bg-gray-50 text-gray-600 border border-gray-200 text-xs"
                    >
                      {{ res.group_type === 'couple' ? '👫' : res.group_type === 'family' ? '👨‍👩‍👧' : '🧍' }}
                      {{ $t(`reservation.group_${res.group_type}`) }}
                    </span>
                    <span v-if="res.children_count > 0" class="badge bg-blue-50 text-blue-600 border border-blue-100 text-xs">
                      🧒 {{ res.children_count }} {{ res.children_count <= 1 ? 'enfant' : 'enfants' }}
                    </span>
                    <span v-if="res.pets?.dog" class="badge bg-amber-50 text-amber-700 border border-amber-100 text-xs">
                      🐕 {{ res.pets.dog }}
                    </span>
                    <span v-if="res.pets?.cat" class="badge bg-amber-50 text-amber-700 border border-amber-100 text-xs">
                      🐈 {{ res.pets.cat }}
                    </span>
                    <span v-if="res.pets?.other" class="badge bg-amber-50 text-amber-700 border border-amber-100 text-xs">
                      🐾 {{ res.pets.other }}
                    </span>
                  </div>
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0">
                  {{ formatDateShort(res.created_at) }}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-4">
          <!-- Share link -->
          <div class="card">
            <h3 class="font-semibold text-gray-900 mb-3">{{ $t('event.share_link') }}</h3>
            <div class="flex items-center gap-2 bg-beige rounded-xl p-3 mb-3">
              <span class="text-xs font-mono text-gray-600 flex-1 truncate">
                {{ shareUrl }}
              </span>
            </div>
            <div class="space-y-2">
              <UiButton variant="secondary" full @click="copyLink">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {{ linkCopied ? $t('event.link_copied') : $t('event.copy_link') }}
              </UiButton>
              <a :href="whatsappUrl" target="_blank" class="btn-sage w-full text-center">
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                {{ $t('event.share_whatsapp') }}
              </a>
            </div>
          </div>

          <!-- Actions -->
          <div v-if="event.status !== 'cancelled' && event.status !== 'archived'" class="card space-y-3">
            <h3 class="font-semibold text-gray-900">Actions</h3>
            <NuxtLink :to="`/events/${event.id}/edit`" class="btn-secondary w-full text-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modifier
            </NuxtLink>
            <UiButton variant="danger-outline" full @click="showCancelModal = true">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              {{ $t('event.cancel_event') }}
            </UiButton>
          </div>
        </div>
      </div>
    </template>

    <!-- Cancel modal -->
    <UiModal
      v-model="showCancelModal"
      :title="$t('event.cancel_event')"
      :description="$t('event.cancel_confirm')"
    >
      <div class="space-y-4 mt-4">
        <UiTextarea
          v-model="cancelReason"
          :label="$t('event.cancel_reason')"
          :rows="3"
          placeholder="Ex: Je suis malade, je dois reporter..."
        />
        <div class="flex gap-3">
          <UiButton variant="danger" :loading="cancelling" @click="cancelEvent">
            Confirmer l'annulation
          </UiButton>
          <UiButton variant="ghost" @click="showCancelModal = false">
            {{ $t('common.cancel') }}
          </UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Event, Reservation, Profile } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const config = useRuntimeConfig()
const { formatDate, formatTime, formatDateShort } = useEventStatus()

const eventId = route.params.id as string
const loading = ref(true)
const event = ref<Event | null>(null)
const reservations = ref<(Reservation & { user: Profile })[]>([])
const showCancelModal = ref(false)
const cancelReason = ref('')
const cancelling = ref(false)
const linkCopied = ref(false)

const confirmedSeats = computed(() =>
  reservations.value.filter((r) => r.status === 'confirmed').length,
)

const shareUrl = computed(() =>
  event.value ? `${config.public.appUrl}/e/${event.value.slug}` : '',
)

const whatsappUrl = computed(() =>
  `https://wa.me/?text=${encodeURIComponent(`Je t'invite à mon repas ! Réserve ta place ici : ${shareUrl.value}`)}`,
)

function getInitials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

async function loadEvent() {
  loading.value = true

  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .eq('organizer_id', user.value!.id)
    .single()

  if (eventError || !eventData) {
    loading.value = false
    return
  }

  event.value = eventData

  const { data: resData } = await supabase
    .from('reservations')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: true })

  if (resData && resData.length > 0) {
    const userIds = resData.map((r) => r.user_id)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds)
    const profileMap = Object.fromEntries((profiles ?? []).map((p: Profile) => [p.id, p]))
    reservations.value = resData.map((r) => ({ ...r, user: profileMap[r.user_id] ?? null })) as (Reservation & { user: Profile })[]
  } else {
    reservations.value = []
  }
  loading.value = false
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    linkCopied.value = true
    setTimeout(() => (linkCopied.value = false), 2000)
  } catch {
    toast.error('Impossible de copier', 'Copiez le lien manuellement.')
  }
}

async function cancelEvent() {
  cancelling.value = true
  try {
    const { error } = await $fetch(`/api/events/${eventId}/cancel`, {
      method: 'POST',
      body: { reason: cancelReason.value },
    })
    if (error) throw new Error(error)

    event.value!.status = 'cancelled'
    showCancelModal.value = false
    toast.success('Repas annulé', 'Les invités ont été notifiés par email.')
  } catch (err) {
    toast.error('Erreur', (err as Error).message)
  } finally {
    cancelling.value = false
  }
}

// Realtime subscription
let channel: ReturnType<typeof supabase.channel> | null = null

onMounted(async () => {
  await loadEvent()

  channel = supabase
    .channel(`event-${eventId}-organizer`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'reservations', filter: `event_id=eq.${eventId}` },
      () => loadEvent(),
    )
    .subscribe()
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

useHead({
  title: computed(() => `${event.value?.title ?? 'Repas'} — Convive`),
})
</script>
