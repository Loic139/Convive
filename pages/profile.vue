<template>
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-10">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">{{ $t('profile.title') }}</h1>

    <div class="grid sm:grid-cols-3 gap-6">
      <!-- Profile card -->
      <div class="sm:col-span-1">
        <div class="card text-center">
          <div class="w-20 h-20 avatar text-2xl mx-auto mb-4">
            {{ initials }}
          </div>
          <h2 class="font-semibold text-gray-900 mb-1">{{ fullName }}</h2>
          <p class="text-sm text-gray-500 mb-5 break-all">{{ user?.email }}</p>

          <UiButton
            v-if="!editing"
            variant="secondary"
            full
            @click="editing = true"
          >
            {{ $t('profile.edit') }}
          </UiButton>

          <form v-else class="text-left space-y-3" @submit.prevent="saveProfile">
            <UiInput
              v-model="editName"
              :label="$t('profile.full_name')"
              required
            />
            <div class="flex gap-2">
              <UiButton type="submit" :loading="saving" full>
                {{ $t('profile.save') }}
              </UiButton>
              <UiButton type="button" variant="ghost" @click="editing = false">
                {{ $t('common.cancel') }}
              </UiButton>
            </div>
          </form>
        </div>
      </div>

      <!-- Reservations -->
      <div class="sm:col-span-2">
        <h2 class="font-semibold text-gray-900 mb-4">{{ $t('profile.my_reservations') }}</h2>

        <div v-if="loadingReservations" class="space-y-3">
          <div v-for="i in 3" :key="i" class="card">
            <UiSkeleton height="h-5" width="w-1/2" class="mb-2" />
            <UiSkeleton height="h-4" width="w-1/3" />
          </div>
        </div>

        <div v-else-if="reservations.length === 0" class="card text-center py-10">
          <div class="text-4xl mb-3">🍽</div>
          <p class="font-medium text-gray-700">{{ $t('profile.reservations_empty') }}</p>
          <p class="text-sm text-gray-500 mt-1">{{ $t('profile.reservations_empty_desc') }}</p>
        </div>

        <div v-else class="space-y-4">
          <!-- Upcoming -->
          <div v-if="upcomingReservations.length > 0">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              {{ $t('profile.upcoming_reservations') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="res in upcomingReservations"
                :key="res.id"
                class="card-hover flex items-center gap-4"
              >
                <div class="flex-1 min-w-0">
                  <NuxtLink :to="`/e/${res.event.slug}`" class="font-medium text-gray-900 hover:text-terracotta transition-colors">
                    {{ res.event.title }}
                  </NuxtLink>
                  <p class="text-sm text-gray-500 mt-0.5 capitalize">
                    {{ formatDate(res.event.date_time) }} · {{ formatTime(res.event.date_time) }}
                  </p>
                </div>
                <UiBadge variant="active" dot>Confirmé</UiBadge>
              </div>
            </div>
          </div>

          <!-- Past -->
          <div v-if="pastReservations.length > 0">
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 mt-6">
              {{ $t('profile.past_reservations') }}
            </p>
            <div class="space-y-3">
              <div
                v-for="res in pastReservations"
                :key="res.id"
                class="card flex items-center gap-4 opacity-60"
              >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-700">{{ res.event.title }}</p>
                  <p class="text-sm text-gray-500 mt-0.5 capitalize">
                    {{ formatDate(res.event.date_time) }}
                  </p>
                </div>
                <UiBadge variant="archived">Passé</UiBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Reservation, Event } from '~/types'

definePageMeta({ middleware: 'auth' })
useHead({ title: 'Mon profil — Convive' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const toast = useToast()
const { formatDate, formatTime, isPast } = useEventStatus()

const editing = ref(false)
const saving = ref(false)
const loadingReservations = ref(true)
const reservations = ref<(Reservation & { event: Event })[]>([])
const fullName = ref('')
const editName = ref('')

const initials = computed(() =>
  (fullName.value || user.value?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase(),
)

const upcomingReservations = computed(() =>
  reservations.value.filter(
    (r) => r.status === 'confirmed' && !isPast(r.event.date_time),
  ),
)

const pastReservations = computed(() =>
  reservations.value.filter(
    (r) => isPast(r.event.date_time) || r.event.status === 'archived',
  ),
)

async function loadProfile() {
  const { data } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.value!.id)
    .single()

  fullName.value = data?.full_name ?? ''
  editName.value = fullName.value
}

async function loadReservations() {
  const { data } = await supabase
    .from('reservations')
    .select('*, event:events(*)')
    .eq('user_id', user.value!.id)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  reservations.value = (data ?? []) as (Reservation & { event: Event })[]
  loadingReservations.value = false
}

async function saveProfile() {
  saving.value = true
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: editName.value.trim() })
    .eq('id', user.value!.id)

  saving.value = false
  if (error) {
    toast.error('Erreur', error.message)
  } else {
    fullName.value = editName.value.trim()
    editing.value = false
    toast.success('Profil mis à jour !')
  }
}

onMounted(() => {
  loadProfile()
  loadReservations()
})
</script>
