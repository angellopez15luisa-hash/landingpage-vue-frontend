<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
const queryClient = useQueryClient()

// 1. Aislamos el query de los textos de la cabecera
const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })

  socket.on('general-setting', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['general-setting'] })
  })
})

onUnmounted(() => {
   // 4. Desconectamos el socket al desmontar el componente para evitar fugas de memoria
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <div class="section-header">
    <h2 class="section-title animate-on-scroll">{{ generalSetting?.textTitleCatalogItem }}</h2>
    <p class="section-subtitle animate-on-scroll">
      {{ generalSetting?.textSubtitleCatalogItem }}
    </p>
  </div>
</template>

<style scoped>
.section-header {
  text-align: center;
  margin-bottom: 40px;
  z-index: 2;
}
.section-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: -1px;
  margin-bottom: 12px;
}
.section-subtitle {
  font-size: 1.05rem;
  color: #9da3c0;
  font-weight: 500;
}
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s ease,
    transform 1.2s ease;
}
.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
