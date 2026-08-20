<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { OrderStepAction } from '@/business/actions/order-step.action'
import { io, Socket } from 'socket.io-client'

const queryClient = useQueryClient()
let socket: Socket | null = null

const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

const { data: orderSteps } = useQuery({
  queryKey: ['order-steps'],
  queryFn: () => OrderStepAction.getAll(),
  retry: false,
})

const initObserver = async () => {
  await nextTick()

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
        } else {
          entry.target.classList.remove('is-visible')
        }
      })
    },
    { threshold: 0.1 },
  )

  // Observamos tanto las tarjetas como los elementos generales con animación
  document.querySelectorAll('.howto-animate-scroll, .animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
}

// Observamos cuando cualquiera de las dos datas esté lista
watch(
  [orderSteps, generalSetting],
  ([steps, settings]) => {
    if ((steps && steps.length > 0) || settings) {
      initObserver()
    }
  },
  { immediate: true },
)


onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })

  // socket.on('connect', () => {
  //   console.log('✅ Navbar conectado al socket con ID:', socket?.id)
  // })

  socket.on('general-setting', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['general-setting'] })
    // queryClient.invalidateQueries({ queryKey: ['item-sections'] })
  })

  socket.on('order-steps', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['order-steps'] })
    // queryClient.invalidateQueries({ queryKey: ['item-sections'] })
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
  <section class="how-to-order-container" id="como-pedir">
    <!-- Degradado ambiental muy sutil y profundo -->
    <div class="section-ambient-glow"></div>

    <!-- Encabezado de la sección -->
    <div class="section-header">
      <h2 class="section-title animate-on-scroll">{{ generalSetting?.textTitleOrderStep }}</h2>
      <p class="section-subtitle animate-on-scroll">{{ generalSetting?.textSubtitleOrderStep }}</p>
    </div>

    <!-- Contenedor de las tarjetas de pasos -->
    <div class="steps-grid">
      <div
        v-for="(step, index) in orderSteps"
        :key="step.id"
        class="step-card howto-animate-scroll"
        :style="{ transitionDelay: `${index * 0.15}s` }"
      >
        <div class="card-glow"></div>
        <span class="step-number">{{ step.number }}</span>
        <h3 class="step-title">{{ step.title }}</h3>
        <p class="step-description">{{ step.description }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- ESTILOS DE LA SECCIÓN ¿CÓMO PEDIR? --- */
.how-to-order-container {
  position: relative;
  width: 100%;
  padding: 120px 20px;
  /* Fondo base más profundo y oscuro para generar contraste */
  background-color: #05070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Resplandor ambiental reducido al mínimo para elegancia y contraste */
.section-ambient-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 15% 25%, rgba(0, 245, 160, 0.025) 0%, transparent 40%),
    radial-gradient(circle at 85% 75%, rgba(0, 217, 245, 0.02) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

/* Encabezado */
.section-header {
  text-align: center;
  margin-bottom: 60px;
  z-index: 2;
}

.section-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  color: var(--text-white, #ffffff);
  text-transform: uppercase;
  letter-spacing: -1px;
  margin-bottom: 15px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-soft, #9da3c0);
  font-weight: 500;
}

/* Cuadrícula de tarjetas */
.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

/* Tarjeta individual con fondo más oscuro para destacar sobre el fondo general */
.step-card {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 45px 35px;
  overflow: hidden;
  z-index: 2;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s ease;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
}

.step-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.05) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.step-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  box-shadow: 0 20px 50px rgba(0, 245, 160, 0.15);
}

.step-card:hover::before {
  opacity: 1;
}

/* Número indicador */
.step-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--accent-mint, #00f5a0);
  margin-bottom: 22px;
  letter-spacing: -1px;
  text-shadow: 0 0 20px rgba(0, 245, 160, 0.3);
}

/* Título del paso */
.step-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-white, #ffffff);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Descripción del paso */
.step-description {
  font-size: 0.98rem;
  color: var(--text-soft, #9da3c0);
  line-height: 1.65;
  font-weight: 400;
}

/* --- SISTEMA DE ANIMACIÓN SUAVE Y LENTA (Idéntico al Catálogo) --- */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1),
    transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.howto-animate-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1),
    transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.howto-animate-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
