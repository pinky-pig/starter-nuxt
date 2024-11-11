<!-- eslint-disable no-console -->
<script setup lang="ts">
import AppIcon from '~/components/layout/AppIcon.vue'
import TheFooter from '~/components/layout/TheFooter.vue'

definePageMeta({
  layout: 'home',
})
const online = useOnline()

onMounted(() => {
  getDDStatus()
  initWebsocket()
})

const ddFetchData = ref<{
  is_run_daka_status: boolean
  status: string
  time: string
}>()
async function getDDStatus() {
  const res = await $fetch('/api/dd', {
    method: 'get',
    query: { status: true },
  })
  ddFetchData.value = res
}
function initWebsocket() {
  const ws = new WebSocket('ws://localhost:3000/api/websocket')
  ws.onopen = () => {
    console.log('Connected to WebSocket server')
    ws.send('Hello from client')
  }
  ws.onmessage = (event) => {
    console.log('Message from server: ', event.data)
  }
  ws.onclose = () => {
    console.log('WebSocket connection closed')
  }
}
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

    <p 
      style="animation-delay: 1s"
      class="animate__animated animate__bounceInDown"
    >
      <em class="text-sm opacity-75">A simple template for Nuxt3.</em>
    </p>

    <p>
      <em class="text-sm opacity-75">{{ ddFetchData?.time }}</em>
    </p>

    <TheFooter />
  </div>
</template>
