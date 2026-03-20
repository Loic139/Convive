<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p v-if="error" class="text-red-600">{{ error }}</p>
      <p v-else class="text-gray-500">Confirmation en cours...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const supabase = useSupabaseClient()
const error = ref('')

onMounted(async () => {
  const token_hash = route.query.token_hash as string
  const type = route.query.type as string
  const next = (route.query.next as string) || '/dashboard'

  if (token_hash && type) {
    const { error: err } = await supabase.auth.verifyOtp({ token_hash, type: type as any })
    if (err) {
      error.value = err.message
      return
    }
  }

  await navigateTo(next)
})
</script>
