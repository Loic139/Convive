<template>
  <div>
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ $t('auth.register_title') }}</h1>
      <p class="text-gray-500 text-sm mb-8">{{ $t('auth.register_subtitle') }}</p>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <UiInput
          v-model="form.full_name"
          :label="$t('auth.full_name')"
          placeholder="Marie Dupont"
          :error="errors.full_name"
          autocomplete="name"
          required
        />

        <UiInput
          v-model="form.email"
          :label="$t('auth.email')"
          type="email"
          placeholder="toi@exemple.com"
          :error="errors.email"
          autocomplete="email"
          required
        />

        <UiInput
          v-model="form.password"
          :label="$t('auth.password')"
          type="password"
          placeholder="Minimum 8 caractères"
          :error="errors.password"
          autocomplete="new-password"
          required
        />

        <UiInput
          v-model="form.confirm_password"
          :label="$t('auth.confirm_password')"
          type="password"
          placeholder="••••••••"
          :error="errors.confirm_password"
          autocomplete="new-password"
          required
        />

        <p v-if="errors.generic" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {{ errors.generic }}
        </p>

        <UiButton type="submit" :loading="loading" full size="lg">
          {{ $t('auth.register') }}
        </UiButton>
      </form>

      <!-- Social login -->
      <AuthSocialAuth :redirect-to="redirectTo" />

      <p class="text-center text-sm text-gray-500 mt-6">
        {{ $t('auth.already_account') }}
        <NuxtLink :to="loginLink" class="text-terracotta font-medium hover:underline">
          {{ $t('auth.login') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest',
})

useHead({ title: 'Créer un compte — Convive' })

const route = useRoute()
const supabase = useSupabaseClient()

const redirectTo = computed(() => (route.query.redirect as string) || '/dashboard')
const loginLink = computed(() => {
  const r = route.query.redirect
  return r ? `/login?redirect=${encodeURIComponent(r as string)}` : '/login'
})

const loading = ref(false)
const form = reactive({ full_name: '', email: '', password: '', confirm_password: '' })
const errors = reactive({ full_name: '', email: '', password: '', confirm_password: '', generic: '' })

function clearErrors() {
  errors.full_name = ''
  errors.email = ''
  errors.password = ''
  errors.confirm_password = ''
  errors.generic = ''
}

function validate() {
  let valid = true
  clearErrors()

  if (!form.full_name.trim()) {
    errors.full_name = 'Le prénom et nom sont requis'
    valid = false
  }

  if (!form.email) {
    errors.email = "L'email est requis"
    valid = false
  }

  if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit faire au moins 8 caractères'
    valid = false
  }

  if (form.password !== form.confirm_password) {
    errors.confirm_password = 'Les mots de passe ne correspondent pas'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return
  loading.value = true

  try {
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { full_name: form.full_name.trim() },
      },
    })
    if (error) throw error
    await navigateTo(redirectTo.value)
  } catch (err: unknown) {
    const msg = (err as Error).message
    if (msg.includes('already registered')) {
      errors.generic = 'Un compte existe déjà avec cet email'
    } else {
      errors.generic = msg || 'Une erreur est survenue'
    }
  } finally {
    loading.value = false
  }
}
</script>
