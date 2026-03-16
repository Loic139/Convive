<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <!-- Titre -->
    <UiInput
      v-model="form.title"
      :label="$t('event.title')"
      :placeholder="$t('event.title_placeholder')"
      :error="errors.title"
      required
      @input="updateSlugPreview"
    />

    <!-- Description -->
    <UiTextarea
      v-model="form.description"
      :label="$t('event.description')"
      :placeholder="$t('event.description_placeholder')"
      :rows="3"
    />

    <!-- Date + Heure -->
    <div class="grid grid-cols-2 gap-4">
      <UiInput
        v-model="form.date"
        :label="$t('event.date')"
        type="date"
        :min="today"
        :error="errors.date"
        required
        @change="updateSlugPreview"
      />
      <UiInput
        v-model="form.time"
        :label="$t('event.time')"
        type="time"
        :error="errors.time"
        required
      />
    </div>

    <!-- Nombre de places -->
    <UiInput
      v-model="form.max_seats"
      :label="$t('event.max_seats')"
      :hint="$t('event.max_seats_hint')"
      type="number"
      min="1"
      max="500"
      :error="errors.max_seats"
      required
    />

    <!-- Enfants & Animaux -->
    <div class="space-y-3">
      <p class="label">{{ $t('event.welcome_options') }}</p>

      <!-- Enfants -->
      <label class="flex items-center justify-between p-4 bg-beige rounded-xl border border-beige-dark cursor-pointer hover:border-terracotta/40 transition-colors">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🧒</span>
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ $t('event.children_allowed') }}</p>
            <p class="text-xs text-gray-500">{{ $t('event.children_allowed_hint') }}</p>
          </div>
        </div>
        <div
          :class="['relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0', form.children_allowed ? 'bg-terracotta' : 'bg-gray-200']"
          @click="form.children_allowed = !form.children_allowed"
        >
          <span
            :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200', form.children_allowed ? 'translate-x-5' : 'translate-x-0']"
          />
        </div>
      </label>

      <!-- Animaux -->
      <label class="flex items-center justify-between p-4 bg-beige rounded-xl border border-beige-dark cursor-pointer hover:border-terracotta/40 transition-colors">
        <div class="flex items-center gap-3">
          <span class="text-2xl">🐾</span>
          <div>
            <p class="font-medium text-gray-900 text-sm">{{ $t('event.pets_allowed') }}</p>
            <p class="text-xs text-gray-500">{{ $t('event.pets_allowed_hint') }}</p>
          </div>
        </div>
        <div
          :class="['relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0', form.pets_allowed ? 'bg-terracotta' : 'bg-gray-200']"
          @click="form.pets_allowed = !form.pets_allowed"
        >
          <span
            :class="['absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200', form.pets_allowed ? 'translate-x-5' : 'translate-x-0']"
          />
        </div>
      </label>
    </div>

    <!-- Aperçu du slug -->
    <div v-if="slugPreview" class="bg-beige rounded-xl p-4 border border-beige-dark">
      <p class="text-xs text-gray-500 mb-1">{{ $t('event.slug_preview') }}</p>
      <p class="text-sm font-mono text-gray-700 break-all">
        {{ appUrl }}/e/<span class="text-terracotta font-semibold">{{ slugPreview }}</span>
      </p>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-3 pt-2">
      <UiButton type="submit" :loading="loading" size="lg">
        {{ isEdit ? $t('event.save') : $t('event.create') }}
      </UiButton>
      <UiButton type="button" variant="ghost" @click="$emit('cancel')">
        {{ $t('common.cancel') }}
      </UiButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { CreateEventPayload } from '~/types'

interface Props {
  initial?: {
    title?: string
    description?: string
    date?: string
    time?: string
    max_seats?: number
    children_allowed?: boolean
    pets_allowed?: boolean
  }
  loading?: boolean
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  isEdit: false,
})

const emit = defineEmits<{
  submit: [payload: CreateEventPayload]
  cancel: []
}>()

const { generateSlug } = useSlug()
const config = useRuntimeConfig()
const appUrl = computed(() => config.public.appUrl)

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: props.initial?.title ?? '',
  description: props.initial?.description ?? '',
  date: props.initial?.date ?? '',
  time: props.initial?.time ?? '19:30',
  max_seats: String(props.initial?.max_seats ?? ''),
  children_allowed: props.initial?.children_allowed ?? false,
  pets_allowed: props.initial?.pets_allowed ?? false,
})

const errors = reactive({
  title: '',
  date: '',
  time: '',
  max_seats: '',
})

const slugPreview = ref('')

function updateSlugPreview() {
  if (form.title) {
    const dateTime = form.date ? `${form.date}T${form.time || '00:00'}` : undefined
    slugPreview.value = generateSlug(form.title, dateTime)
  } else {
    slugPreview.value = ''
  }
}

function validate(): boolean {
  let valid = true
  errors.title = ''
  errors.date = ''
  errors.time = ''
  errors.max_seats = ''

  if (!form.title.trim()) {
    errors.title = 'Le titre est requis'
    valid = false
  }

  if (!form.date) {
    errors.date = 'La date est requise'
    valid = false
  } else if (new Date(form.date) < new Date(today) && !props.isEdit) {
    errors.date = 'La date ne peut pas être dans le passé'
    valid = false
  }

  if (!form.time) {
    errors.time = "L'heure est requise"
    valid = false
  }

  const seats = parseInt(form.max_seats)
  if (!form.max_seats || isNaN(seats)) {
    errors.max_seats = 'Le nombre de places est requis'
    valid = false
  } else if (seats < 1) {
    errors.max_seats = 'Il faut au moins 1 place'
    valid = false
  } else if (seats > 500) {
    errors.max_seats = 'Le maximum est 500 places'
    valid = false
  }

  return valid
}

function handleSubmit() {
  if (!validate()) return

  const date_time = new Date(`${form.date}T${form.time}`).toISOString()

  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    date_time,
    max_seats: parseInt(form.max_seats),
    children_allowed: form.children_allowed,
    pets_allowed: form.pets_allowed,
  })
}

onMounted(() => updateSlugPreview())
</script>
