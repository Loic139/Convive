<template>
  <nav class="bg-white border-b border-beige-dark sticky top-0 z-40">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 font-bold text-xl text-terracotta">
        🍽 Convive
      </NuxtLink>

      <!-- Nav actions -->
      <div class="flex items-center gap-2">
        <template v-if="user">
          <NuxtLink to="/dashboard" class="btn-ghost text-sm hidden sm:flex">
            {{ $t('nav.dashboard') }}
          </NuxtLink>
          <NuxtLink to="/events/new" class="btn-primary text-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span class="hidden sm:inline">{{ $t('nav.create_event') }}</span>
            <span class="sm:hidden">Créer</span>
          </NuxtLink>

          <!-- Avatar menu -->
          <div class="relative" v-click-outside="() => menuOpen = false">
            <button
              type="button"
              class="w-9 h-9 avatar text-sm"
              @click="menuOpen = !menuOpen"
            >
              {{ initials }}
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-card-hover border border-beige-dark py-1 z-50"
            >
              <NuxtLink
                to="/profile"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-beige transition-colors"
                @click="menuOpen = false"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {{ $t('nav.profile') }}
              </NuxtLink>
              <NuxtLink
                to="/dashboard"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-beige transition-colors sm:hidden"
                @click="menuOpen = false"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {{ $t('nav.dashboard') }}
              </NuxtLink>
              <div class="divider my-1" />
              <button
                type="button"
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                @click="logout"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ $t('nav.logout') }}
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <NuxtLink to="/login" class="btn-ghost text-sm">
            {{ $t('nav.login') }}
          </NuxtLink>
          <NuxtLink to="/register" class="btn-primary text-sm">
            {{ $t('auth.register') }}
          </NuxtLink>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const menuOpen = ref(false)

const initials = computed(() => {
  const name = (user.value?.user_metadata?.full_name as string) || user.value?.email || '?'
  return name
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

async function logout() {
  menuOpen.value = false
  await supabase.auth.signOut()
  await navigateTo('/')
}

// Directive v-click-outside
const vClickOutside = {
  mounted(el: HTMLElement, binding: { value: () => void }) {
    el._clickOutside = (event: MouseEvent) => {
      if (!el.contains(event.target as Node)) {
        binding.value()
      }
    }
    document.addEventListener('click', el._clickOutside)
  },
  unmounted(el: HTMLElement) {
    document.removeEventListener('click', el._clickOutside)
    delete el._clickOutside
  },
}
</script>
