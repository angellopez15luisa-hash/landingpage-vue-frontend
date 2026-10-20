<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { OrderStepAction } from '@/business/actions/order-step.action'
import { io, Socket } from 'socket.io-client'

const queryClient = useQueryClient()
let socket: Socket | null = null

// 🔹 Control de carga diferida (Lazy Query) según el hash actual
const isTargetHash = window.location.hash === '#como-pedir'
const shouldFetch = ref(isTargetHash)

onMounted(() => {
  if (!isTargetHash) {
    setTimeout(() => {
      shouldFetch.value = true
    }, 500)
  }

  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })

  socket.on('general-setting', (data) => {
    console.log('🎯 ¡Evento recibido en HowToOrder (General Setting)!', data)
    queryClient.invalidateQueries({ queryKey: ['general-setting'] })
  })

  socket.on('order-steps', (data) => {
    console.log('🎯 ¡Evento recibido en HowToOrder (Order Steps)!', data)
    queryClient.invalidateQueries({ queryKey: ['order-steps'] })
  })
})

const { data: generalSetting, isLoading: isLoadingSettings } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  enabled: shouldFetch,
  retry: false,
})

const { data: orderSteps, isLoading: isLoadingSteps } = useQuery({
  queryKey: ['order-steps'],
  queryFn: () => OrderStepAction.getAll(),
  enabled: shouldFetch,
  retry: false,
})

// Computada para saber si cualquiera de los dos sigue cargando de la API
const isLoading = computed(() => shouldFetch.value && (isLoadingSettings.value || isLoadingSteps.value))

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

  document.querySelectorAll('.howto-animate-scroll, .animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
}

watch(
  [orderSteps, generalSetting],
  ([steps, settings]) => {
    if ((steps && steps.length > 0) || settings) {
      initObserver()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <section class="how-to-order-container" id="como-pedir">
    <div class="section-ambient-glow"></div>

    <!-- 🔹 Spinner interno mientras la API responde -->
    <div v-if="isLoading" class="howto-loading-state">
      <div class="spinner-howto"></div>
      <p>Cargando sección...</p>
    </div>

    <!-- 🔹 Contenido visible solo cuando ya cargó -->
    <template v-else>
      <div class="section-header">
        <h2 class="section-title animate-on-scroll">{{ generalSetting?.textTitleOrderStep }}</h2>
        <p class="section-subtitle animate-on-scroll">{{ generalSetting?.textSubtitleOrderStep }}</p>
      </div>

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
    </template>
  </section>
</template>

<style scoped>
.how-to-order-container {
  position: relative;
  width: 100%;
  padding: 120px 20px;
  background-color: #05070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  min-height: 450px;
}

/* --- ESTILOS DEL SPINNER INTERNO --- */
.howto-loading-state {
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  z-index: 2;
  color: #9da3c0;
  font-size: 0.95rem;
}

.spinner-howto {
  width: 45px;
  height: 45px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: #00f5a0;
  border-radius: 50%;
  animation: spinHowTo 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

@keyframes spinHowTo {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

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

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

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

.step-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--accent-mint, #00f5a0);
  margin-bottom: 22px;
  letter-spacing: -1px;
  text-shadow: 0 0 20px rgba(0, 245, 160, 0.3);
}

.step-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-white, #ffffff);
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.step-description {
  font-size: 0.98rem;
  color: var(--text-soft, #9da3c0);
  line-height: 1.65;
  font-weight: 400;
}

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
