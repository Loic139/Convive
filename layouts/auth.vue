<template>
  <div class="min-h-screen bg-beige flex flex-col items-center justify-center px-4 py-12">
    <NuxtLink to="/" class="flex items-center gap-2 mb-10">
      <span class="text-2xl font-bold text-terracotta">🍽 Convive</span>
    </NuxtLink>
    <div class="w-full max-w-md">
      <slot />
    </div>
    <UiToastContainer />
  </div>
</template>
