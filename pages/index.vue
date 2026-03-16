<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-br from-terracotta-50 via-beige to-sage-50 py-20 sm:py-28 px-4">
      <div class="max-w-3xl mx-auto text-center">
        <div class="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm text-terracotta text-sm font-medium px-4 py-2 rounded-full border border-terracotta/20 mb-8">
          🍽 Simple · Rapide · Convivial
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-balance mb-6">
          {{ $t('landing.hero_title') }}
        </h1>
        <p class="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 text-balance">
          {{ $t('landing.hero_subtitle') }}
        </p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <NuxtLink
            :to="user ? '/events/new' : '/register'"
            class="btn-primary-lg"
          >
            {{ $t('landing.hero_cta') }}
          </NuxtLink>
          <a href="#how" class="btn bg-white text-gray-700 border border-gray-200 hover:bg-beige px-7 py-3.5 text-base rounded-2xl">
            {{ $t('landing.hero_cta_secondary') }}
          </a>
        </div>
      </div>

      <!-- Decorative elements -->
      <div class="absolute -top-10 -right-10 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-10 -left-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
    </section>

    <!-- How it works -->
    <section id="how" class="py-20 px-4 bg-white">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{{ $t('landing.how_title') }}</h2>
        </div>

        <div class="grid sm:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-terracotta-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
              🗓️
            </div>
            <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ $t('landing.step1_title') }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ $t('landing.step1_desc') }}</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-sage-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
              🔗
            </div>
            <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ $t('landing.step2_title') }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ $t('landing.step2_desc') }}</p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-beige-dark rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
              👥
            </div>
            <h3 class="font-semibold text-lg text-gray-900 mb-2">{{ $t('landing.step3_title') }}</h3>
            <p class="text-gray-500 text-sm leading-relaxed">{{ $t('landing.step3_desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Convive -->
    <section class="py-20 px-4 bg-beige">
      <div class="max-w-5xl mx-auto">
        <div class="text-center mb-14">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{{ $t('landing.why_title') }}</h2>
        </div>

        <div class="grid sm:grid-cols-3 gap-6">
          <div class="card">
            <div class="text-2xl mb-4">⚡</div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ $t('landing.reason1_title') }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ $t('landing.reason1_desc') }}</p>
          </div>
          <div class="card">
            <div class="text-2xl mb-4">🔴</div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ $t('landing.reason2_title') }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ $t('landing.reason2_desc') }}</p>
          </div>
          <div class="card">
            <div class="text-2xl mb-4">📧</div>
            <h3 class="font-semibold text-gray-900 mb-2">{{ $t('landing.reason3_title') }}</h3>
            <p class="text-sm text-gray-500 leading-relaxed">{{ $t('landing.reason3_desc') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA -->
    <section class="py-20 px-4 bg-terracotta text-white text-center">
      <div class="max-w-2xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold mb-4 text-balance">
          Prêt à organiser votre prochain repas ?
        </h2>
        <p class="text-terracotta-100 mb-8 text-lg">
          Créez un compte gratuit et invitez vos amis en 2 minutes.
        </p>
        <NuxtLink
          :to="user ? '/events/new' : '/register'"
          class="btn bg-white text-terracotta hover:bg-terracotta-50 px-8 py-4 text-base rounded-2xl font-semibold"
        >
          {{ $t('landing.hero_cta') }}
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser()

useHead({
  title: 'Convive — Organisez vos repas entre amis',
})
</script>
