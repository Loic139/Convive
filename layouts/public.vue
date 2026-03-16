<template>
  <div class="min-h-screen bg-beige flex flex-col">
    <header class="px-4 py-4 border-b border-beige-dark bg-white/80 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="text-xl font-bold text-terracotta">🍽 Convive</span>
        </NuxtLink>
        <template v-if="user">
          <NuxtLink to="/dashboard" class="btn-ghost text-sm">
            {{ $t('nav.dashboard') }}
          </NuxtLink>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn-secondary text-sm">
            {{ $t('nav.login') }}
          </NuxtLink>
        </template>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
    <UiToastContainer />
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>
