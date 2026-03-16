<template>
  <div class="w-full">
    <label v-if="label" :for="id" class="label">
      {{ label }}
      <span v-if="required" class="text-terracotta ml-0.5">*</span>
    </label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :min="min"
      :max="max"
      :autocomplete="autocomplete"
      :class="['input', { 'input-error': error }]"
      v-bind="$attrs"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @blur="$emit('blur', $event)"
    />
    <p v-if="error" class="error-message">{{ error }}</p>
    <p v-else-if="hint" class="text-sm text-gray-500 mt-1">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
  min?: string | number
  max?: string | number
  autocomplete?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  id: () => `input-${Math.random().toString(36).slice(2)}`,
})

defineEmits<{
  'update:modelValue': [value: string]
  blur: [event: FocusEvent]
}>()
</script>
