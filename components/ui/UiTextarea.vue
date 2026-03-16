<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label">
      {{ label }}
      <span v-if="required" class="text-terracotta ml-0.5">*</span>
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="['textarea', { 'input-error': error }]"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  id?: string
}

withDefaults(defineProps<Props>(), {
  rows: 4,
  disabled: false,
  required: false,
  id: () => `textarea-${Math.random().toString(36).slice(2)}`,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
