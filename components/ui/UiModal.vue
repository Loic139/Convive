<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="$emit('update:modelValue', false)"
      >
        <!-- Overlay -->
        <div class="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />

        <!-- Panel -->
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</h3>
              <p v-if="description" class="text-sm text-gray-500 mt-1">{{ description }}</p>
            </div>
            <button
              type="button"
              class="text-gray-400 hover:text-gray-600 transition-colors ml-4 mt-0.5"
              @click="$emit('update:modelValue', false)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title?: string
  description?: string
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
