<template>
  <div class="max-w-2xl mx-auto px-4 py-8 sm:py-12">
    <!-- Loading skeleton -->
    <div v-if="loading" class="space-y-6">
      <UiSkeleton height="h-8" width="w-3/4" />
      <UiSkeleton height="h-5" width="w-1/2" />
      <UiSkeleton height="h-40" width="w-full" />
      <UiSkeleton height="h-14" width="w-full" class="rounded-2xl" />
    </div>

    <!-- Not found -->
    <div v-else-if="!event" class="text-center py-20">
      <div class="text-6xl mb-4">🍽</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">Repas introuvable</h1>
      <p class="text-gray-500 mb-6">Ce lien n'est plus valide ou le repas a été supprimé.</p>
      <NuxtLink to="/" class="btn-primary">Retour à l'accueil</NuxtLink>
    </div>

    <!-- Event page -->
    <template v-else>
      <!-- Organizer -->
      <p class="text-sm text-gray-500 mb-3">
        {{ $t('event.organizer') }} ·
        <span class="font-medium text-gray-700">{{ organizerName }}</span>
      </p>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
        {{ event.title }}
      </h1>

      <!-- Main card -->
      <div class="card mb-6">
        <!-- Date & Time -->
        <div class="flex flex-wrap gap-5 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-terracotta-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-terracotta" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Date</p>
              <p class="font-semibold text-gray-900 capitalize">{{ formattedDate }}</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-sage-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wide">Heure</p>
              <p class="font-semibold text-gray-900">{{ formattedTime }}</p>
            </div>
          </div>
        </div>

        <!-- Seats -->
        <div class="border-t border-beige-dark pt-5 mb-6">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Places disponibles</p>
          <SeatIndicator :confirmed-seats="confirmedSeats" :max-seats="event.max_seats" />
        </div>

        <!-- Enfants & Animaux bienvenus -->
        <div v-if="event.children_allowed || event.pets_allowed" class="border-t border-beige-dark pt-5 mb-6">
          <p class="text-xs text-gray-400 font-medium uppercase tracking-wide mb-3">Bienvenus</p>
          <div class="flex flex-wrap gap-2">
            <span v-if="event.children_allowed" class="badge bg-blue-50 text-blue-700 border border-blue-100">
              🧒 Enfants bienvenus
            </span>
            <span v-if="event.pets_allowed" class="badge bg-amber-50 text-amber-700 border border-amber-100">
              🐾 Animaux bienvenus
            </span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="event.description" :class="['pt-5 text-sm text-gray-600 whitespace-pre-wrap', (event.children_allowed || event.pets_allowed) ? '' : 'border-t border-beige-dark']">
          {{ event.description }}
        </div>
      </div>

      <!-- Status message -->
      <div v-if="event.status === 'cancelled'" class="bg-red-50 border border-red-100 rounded-2xl p-5 mb-6">
        <p class="font-semibold text-red-700 mb-1">Ce repas a été annulé</p>
        <p v-if="event.cancel_reason" class="text-sm text-red-600">{{ event.cancel_reason }}</p>
      </div>

      <div v-else-if="event.status === 'archived' || isPast(event.date_time)" class="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
        <p class="font-semibold text-gray-600">Ce repas est passé</p>
      </div>

      <!-- Already reserved -->
      <div v-else-if="myReservation" class="bg-sage-50 border border-sage-100 rounded-2xl p-5 mb-6">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 bg-sage text-white rounded-full flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="font-semibold text-sage-dark">{{ $t('reservation.already_reserved') }}</p>
        </div>
        <p class="text-sm text-sage-dark mb-4">
          Un email de confirmation t'a été envoyé. Tu recevras un rappel 24h avant le repas.
        </p>
        <UiButton variant="danger-outline" size="sm" @click="showCancelModal = true">
          {{ $t('reservation.cancel') }}
        </UiButton>
      </div>

      <!-- CTA Button -->
      <div v-else>
        <template v-if="user">
          <UiButton
            v-if="event.status !== 'active'"
            size="lg"
            full
            disabled
          >
            <template v-if="event.status === 'full'">🔴 {{ $t('reservation.cta_full') }}</template>
            <template v-else-if="event.status === 'cancelled'">{{ $t('reservation.cta_cancelled') }}</template>
            <template v-else>{{ $t('reservation.cta_past') }}</template>
          </UiButton>
          <UiButton
            v-else
            size="lg"
            full
            @click="showReserveModal = true"
          >
            🍽 {{ $t('reservation.cta') }}
          </UiButton>
        </template>
        <template v-else>
          <NuxtLink
            :to="`/login?redirect=${encodeURIComponent($route.fullPath)}`"
            class="btn-primary-lg w-full text-center block"
          >
            🍽 {{ $t('reservation.login_to_reserve') }}
          </NuxtLink>
          <p class="text-center text-sm text-gray-500 mt-3">
            Pas encore de compte ?
            <NuxtLink :to="`/register?redirect=${encodeURIComponent($route.fullPath)}`" class="text-terracotta hover:underline">
              Inscris-toi gratuitement
            </NuxtLink>
          </p>
        </template>
      </div>
    </template>

    <!-- Reserve modal (avec extras si besoin) -->
    <UiModal
      v-model="showReserveModal"
      title="Réserver ma place"
      :description="event ? event.title : ''"
    >
      <div class="mt-4 space-y-5">
        <EventsReservationExtrasForm
          v-if="event && (event.children_allowed || event.pets_allowed)"
          :children-allowed="event.children_allowed"
          :pets-allowed="event.pets_allowed"
          @update="onExtrasUpdate"
        />
        <div class="flex gap-3">
          <UiButton :loading="reserving" @click="reserve">
            🍽 Confirmer ma réservation
          </UiButton>
          <UiButton variant="ghost" @click="showReserveModal = false">
            {{ $t('common.cancel') }}
          </UiButton>
        </div>
      </div>
    </UiModal>

    <!-- Cancel reservation modal -->
    <UiModal
      v-model="showCancelModal"
      :title="$t('reservation.cancel_confirm')"
      :description="$t('reservation.cancel_confirm_desc')"
    >
      <div class="flex gap-3 mt-5">
        <UiButton variant="danger" :loading="cancelling" @click="cancelReservation">
          {{ $t('reservation.cancel_cta') }}
        </UiButton>
        <UiButton variant="ghost" @click="showCancelModal = false">
          {{ $t('reservation.keep_cta') }}
        </UiButton>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Event, Reservation } from '~/types'

definePageMeta({ layout: 'public' })

const route = useRoute()
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const { formatDate, formatTime, isPast } = useEventStatus()

const slug = route.params.slug as string
const loading = ref(true)
const reserving = ref(false)
const cancelling = ref(false)
const showCancelModal = ref(false)
const showReserveModal = ref(false)
const reservationExtras = ref<{ children_count: number; pets: { dog: number; cat: number; other: number } | null }>({
  children_count: 0,
  pets: null,
})

function onExtrasUpdate(extras: typeof reservationExtras.value) {
  reservationExtras.value = extras
}
const event = ref<Event & { organizer?: { full_name: string | null } } | null>(null)
const myReservation = ref<Reservation | null>(null)
const confirmedSeats = ref(0)

const organizerName = computed(() => event.value?.organizer?.full_name ?? 'L\'organisateur')
const formattedDate = computed(() => event.value ? formatDate(event.value.date_time) : '')
const formattedTime = computed(() => event.value ? formatTime(event.value.date_time) : '')

async function loadEvent() {
  const { data: eventData } = await supabase
    .from('events')
    .select('*, organizer:profiles(full_name)')
    .eq('slug', slug)
    .single()

  if (!eventData) {
    loading.value = false
    return
  }

  event.value = eventData

  // Count confirmed seats
  const { count } = await supabase
    .from('reservations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventData.id)
    .eq('status', 'confirmed')

  confirmedSeats.value = count ?? 0

  // Check if current user has a reservation
  if (user.value) {
    const { data: resData } = await supabase
      .from('reservations')
      .select('*')
      .eq('event_id', eventData.id)
      .eq('user_id', user.value.id)
      .eq('status', 'confirmed')
      .maybeSingle()

    myReservation.value = resData
  }

  loading.value = false
}

async function reserve() {
  if (!user.value || !event.value) return
  reserving.value = true

  showReserveModal.value = false
  try {
    await $fetch('/api/reservations', {
      method: 'POST',
      body: {
        event_id: event.value.id,
        children_count: reservationExtras.value.children_count,
        pets: reservationExtras.value.pets,
      },
    })

    toast.success(
      'Place réservée ! 🎉',
      'Un email de confirmation a été envoyé.',
    )
    await loadEvent()
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string } }).data?.message || (err as Error).message
    if (msg?.includes('already')) {
      toast.error('Déjà réservé', 'Tu as déjà une réservation pour ce repas.')
    } else if (msg?.includes('full')) {
      toast.error('Complet', 'Ce repas vient de se remplir.')
    } else {
      toast.error('Erreur', msg || 'Impossible de réserver.')
    }
    await loadEvent()
  } finally {
    reserving.value = false
  }
}

async function cancelReservation() {
  if (!myReservation.value) return
  cancelling.value = true

  try {
    await $fetch(`/api/reservations/${myReservation.value.id}/cancel`, {
      method: 'POST',
    })

    toast.success('Réservation annulée', 'Ta place a été libérée.')
    myReservation.value = null
    showCancelModal.value = false
    await loadEvent()
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

  if (event.value) {
    channel = supabase
      .channel(`event-${event.value.id}-public`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `event_id=eq.${event.value.id}`,
        },
        async (payload) => {
          // Refresh seats count in real time
          const { count } = await supabase
            .from('reservations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.value!.id)
            .eq('status', 'confirmed')

          confirmedSeats.value = count ?? 0

          // Refresh event status
          const { data } = await supabase
            .from('events')
            .select('status')
            .eq('id', event.value!.id)
            .single()

          if (data && event.value) {
            event.value.status = data.status
          }
        },
      )
      .subscribe()
  }
})

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel)
})

useHead({
  title: computed(() => `${event.value?.title ?? 'Repas'} — Convive`),
})
</script>
