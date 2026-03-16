<template>
  <div :class="['skeleton', sizeClass, $attrs.class]" />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  height?: string
  width?: string
  rounded?: boolean
}>()

const sizeClass = computed(() => {
  const classes = []
  if (props.height) classes.push(props.height)
  if (props.width) classes.push(props.width)
  if (props.rounded) classes.push('rounded-full')
  return classes.join(' ')
})
</script>
