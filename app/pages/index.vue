<script setup lang="ts">
import AppIcon from '~/components/layout/AppIcon.vue'
import TheFooter from '~/components/layout/TheFooter.vue'

definePageMeta({
  layout: 'home',
})
const online = useOnline()
</script>

<template>
  <div>
    <Suspense>
      <ClientOnly>
        <PageView v-if="online" />
        <div v-else text-gray:80>
          You're offline
        </div>
      </ClientOnly>
      <template #fallback>
        <div italic op50>
          <span animate-pulse>Loading...</span>
        </div>
      </template>
    </Suspense>

    <div class="py-8" />

    <AppIcon class="mb-4 inline-block h-12 w-12" />

    <h1 class="mb-2 text-4xl font-bold">
      Starter Nuxt3
    </h1>

    <p>
      <em class="text-sm opacity-75">A simple template for Nuxt3.</em>
    </p>

    <TheFooter />
  </div>
</template>
