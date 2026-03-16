<template>
  <component
    :is="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    :class="classes"
    v-bind="$attrs"
  >
    <UiSpinner v-if="loading" class="w-4 h-4" />
    <slot />
  </component>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sage' | 'danger' | 'danger-outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  to?: string
  type?: 'button' | 'submit' | 'reset'
  full?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  loading: false,
  disabled: false,
  type: 'button',
  full: false,
})

const variantClasses: Record<string, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  sage: 'btn-sage',
  danger: 'btn-danger',
  'danger-outline': 'btn-danger-outline',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3.5 py-2 text-xs rounded-lg',
  md: '',
  lg: 'px-7 py-3.5 text-base rounded-2xl',
}

const classes = computed(() => [
  variantClasses[props.variant],
  sizeClasses[props.size],
  { 'w-full': props.full },
])
</script>
