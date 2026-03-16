<template>
  <div>
    <div class="card">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">{{ $t('auth.login_title') }}</h1>
      <p class="text-gray-500 text-sm mb-8">{{ $t('auth.login_subtitle') }}</p>

      <!-- Magic link toggle -->
      <div class="flex rounded-xl border border-beige-dark overflow-hidden mb-8">
        <button
          type="button"
          :class="['flex-1 py-2.5 text-sm font-medium transition-colors', !magicLink ? 'bg-terracotta text-white' : 'text-gray-500 hover:bg-beige']"
          @click="magicLink = false"
        >
          Email + mot de passe
        </button>
        <button
          type="button"
          :class="['flex-1 py-2.5 text-sm font-medium transition-colors', magicLink ? 'bg-terracotta text-white' : 'text-gray-500 hover:bg-beige']"
          @click="magicLink = true"
        >
          {{ $t('auth.magic_link') }}
        </button>
      </div>

      <!-- Magic link sent -->
      <div v-if="magicLinkSent" class="bg-sage-50 border border-sage-100 rounded-xl p-5 text-center">
        <div class="text-3xl mb-3">📬</div>
        <p class="font-semibold text-gray-900 mb-1">Email envoyé !</p>
        <p class="text-sm text-gray-600">
          {{ $t('auth.magic_link_sent', { email: form.email }) }}
        </p>
      </div>

      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
        <UiInput
          v-model="form.email"
          :label="$t('auth.email')"
          type="email"
          placeholder="toi@exemple.com"
          :error="errors.email"
          autocomplete="email"
          required
        />

        <template v-if="!magicLink">
          <div>
            <UiInput
              v-model="form.password"
              :label="$t('auth.password')"
              type="password"
              placeholder="••••••••"
              :error="errors.password"
              autocomplete="current-password"
              required
            />
            <div class="flex justify-end mt-2">
              <button
                type="button"
                class="text-xs text-terracotta hover:underline"
                @click="forgotPassword"
              >
                {{ $t('auth.forgot_password') }}
              </button>
            </div>
          </div>
        </template>

        <p v-if="errors.generic" class="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
          {{ errors.generic }}
        </p>

        <UiButton type="submit" :loading="loading" full size="lg">
          {{ magicLink ? $t('auth.magic_link') : $t('auth.login') }}
        </UiButton>
      </form>

      <p class="text-center text-sm text-gray-500 mt-6">
        {{ $t('auth.no_account') }}
        <NuxtLink :to="registerLink" class="text-terracotta font-medium hover:underline">
          {{ $t('auth.register') }}
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

useHead({ title: 'Connexion — Convive' })

const route = useRoute()
const supabase = useSupabaseClient()
const toast = useToast()

const redirectTo = computed(() => (route.query.redirect as string) || '/dashboard')
const registerLink = computed(() => {
  const r = route.query.redirect
  return r ? `/register?redirect=${encodeURIComponent(r as string)}` : '/register'
})

const magicLink = ref(false)
const magicLinkSent = ref(false)
const loading = ref(false)

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '', generic: '' })

const config = useRuntimeConfig()

function clearErrors() {
  errors.email = ''
  errors.password = ''
  errors.generic = ''
}

async function handleSubmit() {
  clearErrors()
  loading.value = true

  try {
    if (magicLink.value) {
      const { error } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: `${config.public.appUrl}/confirm?redirect=${encodeURIComponent(redirectTo.value)}`,
        },
      })
      if (error) throw error
      magicLinkSent.value = true
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      })
      if (error) throw error
      await navigateTo(redirectTo.value)
    }
  } catch (err: unknown) {
    const msg = (err as Error).message
    if (msg.includes('Invalid login credentials')) {
      errors.generic = "Email ou mot de passe incorrect"
    } else {
      errors.generic = msg || "Une erreur est survenue"
    }
  } finally {
    loading.value = false
  }
}

async function forgotPassword() {
  if (!form.email) {
    errors.email = "Entrez votre email d'abord"
    return
  }
  loading.value = true
  const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
    redirectTo: `${config.public.appUrl}/reset-password`,
  })
  loading.value = false
  if (error) {
    errors.generic = error.message
  } else {
    toast.success('Email envoyé !', 'Vérifie ta boîte mail pour réinitialiser ton mot de passe.')
  }
}
</script>
