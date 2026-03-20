<template>
  <div class="space-y-5">
    <!-- Type de groupe -->
    <div>
      <label class="label">👥 {{ $t('reservation.group_type') }}</label>
      <div class="grid grid-cols-3 gap-2 mt-2">
        <button
          v-for="option in groupOptions"
          :key="option.value"
          type="button"
          :class="[
            'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-colors text-sm font-medium',
            localGroupType === option.value
              ? 'border-terracotta bg-terracotta-50 text-terracotta'
              : 'border-gray-200 bg-white text-gray-600 hover:bg-beige',
          ]"
          @click="localGroupType = option.value"
        >
          <span class="text-xl">{{ option.emoji }}</span>
          <span>{{ option.label }}</span>
        </button>
      </div>
    </div>

    <!-- Enfants -->
    <div v-if="childrenAllowed">
      <label class="label">🧒 {{ $t('reservation.children_count') }}</label>
      <div class="flex items-center gap-4 mt-2">
        <button
          type="button"
          class="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-beige transition-colors disabled:opacity-40"
          :disabled="localChildren === 0"
          @click="localChildren = Math.max(0, localChildren - 1)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>
        <span class="text-2xl font-bold text-gray-900 w-8 text-center tabular-nums">{{ localChildren }}</span>
        <button
          type="button"
          class="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-beige transition-colors"
          @click="localChildren++"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <span class="text-sm text-gray-500">{{ localChildren <= 1 ? 'enfant' : 'enfants' }}</span>
      </div>
    </div>

    <!-- Animaux -->
    <div v-if="petsAllowed">
      <label class="label">🐾 {{ $t('reservation.pets') }}</label>
      <div class="space-y-2 mt-2">
        <!-- Chien -->
        <div class="flex items-center justify-between p-3 bg-beige rounded-xl border border-beige-dark">
          <span class="text-sm font-medium text-gray-700 flex items-center gap-2">🐕 {{ $t('reservation.pet_dog') }}</span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-40"
              :disabled="localPets.dog === 0"
              @click="localPets.dog = Math.max(0, localPets.dog - 1)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <span class="text-base font-semibold w-4 text-center tabular-nums">{{ localPets.dog }}</span>
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              @click="localPets.dog++"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat -->
        <div class="flex items-center justify-between p-3 bg-beige rounded-xl border border-beige-dark">
          <span class="text-sm font-medium text-gray-700 flex items-center gap-2">🐈 {{ $t('reservation.pet_cat') }}</span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-40"
              :disabled="localPets.cat === 0"
              @click="localPets.cat = Math.max(0, localPets.cat - 1)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <span class="text-base font-semibold w-4 text-center tabular-nums">{{ localPets.cat }}</span>
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              @click="localPets.cat++"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Autre -->
        <div class="flex items-center justify-between p-3 bg-beige rounded-xl border border-beige-dark">
          <span class="text-sm font-medium text-gray-700 flex items-center gap-2">🐾 {{ $t('reservation.pet_other') }}</span>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors disabled:opacity-40"
              :disabled="localPets.other === 0"
              @click="localPets.other = Math.max(0, localPets.other - 1)"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
              </svg>
            </button>
            <span class="text-base font-semibold w-4 text-center tabular-nums">{{ localPets.other }}</span>
            <button
              type="button"
              class="w-7 h-7 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:bg-white transition-colors"
              @click="localPets.other++"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Pets, GroupType } from '~/types'

const props = defineProps<{
  childrenAllowed: boolean
  petsAllowed: boolean
}>()

const emit = defineEmits<{
  update: [extras: { group_type: GroupType; children_count: number; pets: Pets | null }]
}>()

const { t } = useI18n()

const groupOptions = computed(() => [
  { value: 'solo' as GroupType, emoji: '🧍', label: t('reservation.group_solo') },
  { value: 'couple' as GroupType, emoji: '👫', label: t('reservation.group_couple') },
  { value: 'family' as GroupType, emoji: '👨‍👩‍👧', label: t('reservation.group_family') },
])

const localGroupType = ref<GroupType>('solo')
const localChildren = ref(0)
const localPets = reactive<Pets>({ dog: 0, cat: 0, other: 0 })

watch(
  [localGroupType, localChildren, localPets],
  () => {
    const totalPets = localPets.dog + localPets.cat + localPets.other
    emit('update', {
      group_type: localGroupType.value,
      children_count: localChildren.value,
      pets: props.petsAllowed && totalPets > 0 ? { ...localPets } : null,
    })
  },
  { deep: true },
)
</script>
