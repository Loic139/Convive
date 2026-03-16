<template>
  <div class="min-h-screen flex flex-col">
    <AppNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <UiToastContainer />
  </div>
</template>
