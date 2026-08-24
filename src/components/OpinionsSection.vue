<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { io, Socket } from 'socket.io-client'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { ReviewOpinionAction } from '@/business/actions/review-opinion.action'

const queryClient = useQueryClient()
let socket: Socket | null = null

// Paginación
const paginaActual = ref(1)
const porPagina = ref(3) // Exactamente 3 columnas en una sola fila por página

const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

const { data: reviewOpinions } = useQuery({
  queryKey: ['review-opinions'],
  queryFn: () => ReviewOpinionAction.getAll(),
  retry: false,
})

// Función auxiliar robusta para convertir cualquier formato a booleano real
const parseBooleanState = (value: unknown): boolean => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1'
  }
  return Boolean(value)
}

// 1. Filtrar solo las opiniones activas
const activeReviews = computed(() => {
  const rawData = reviewOpinions.value
  const list = Array.isArray(rawData) ? rawData : (rawData as any)?.data ?? (rawData as any)?.items ?? []

  if (!Array.isArray(list)) return []

  return list.filter((rev: any) => {
    const rawStatus = rev.isActive ?? rev.is_active
    return parseBooleanState(rawStatus)
  })
})

// 2. Total de páginas basadas en los elementos activos
const totalPaginas = computed(() => Math.ceil(activeReviews.value.length / porPagina.value) || 1)

// 3. Recortar las opiniones para mostrar solo las 3 de la página actual
const reviewsPaginadas = computed(() => {
  const inicio = (paginaActual.value - 1) * porPagina.value
  const fin = inicio + porPagina.value
  return activeReviews.value.slice(inicio, fin)
})

// 4. Generar la paginación inteligente con puntos suspensivos (...)
const paginasVisibles = computed(() => {
  const total = totalPaginas.value
  const actual = paginaActual.value
  const delta = 1 // Cuántos números mostrar alrededor de la página actual
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []

  range.push(1)

  for (let i = 2; i <= total; i++) {
    if (i === 1 || i === total || (i >= actual - delta && i <= actual + delta)) {
      range.push(i)
    }
  }

  let l: number | undefined
  for (const i of range) {
    if (typeof i === 'number') {
      if (l !== undefined) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    }
  }

  return rangeWithDots
})

const cambiarPagina = (nuevaPagina: number | string) => {
  if (typeof nuevaPagina === 'number' && nuevaPagina >= 1 && nuevaPagina <= totalPaginas.value) {
    paginaActual.value = nuevaPagina
  }
}

// Observer para animaciones
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

  document.querySelectorAll('.opinion-animate-scroll, .animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
}

// Watch para reiniciar observer al cambiar de página o datos
watch(
  [reviewsPaginadas, generalSetting],
  () => {
    initObserver()
  },
  { immediate: true },
)

onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })

  socket.on('general-setting', () => {
    queryClient.invalidateQueries({ queryKey: ['general-setting'] })
  })

  socket.on('review-opinions', () => {
    queryClient.invalidateQueries({ queryKey: ['review-opinions'] })
  })
})

onUnmounted(() => {
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <section class="opinions-section" id="opiniones">
    <div class="section-ambient-glow"></div>

    <div class="section-header">
      <h2 class="section-title animate-on-scroll">{{ generalSetting?.textTitleReviewOpinion }}</h2>
      <p class="section-subtitle animate-on-scroll">
        {{ generalSetting?.textSubtitleReviewOpinion }}
      </p>
    </div>

    <!-- Contenedor estricto de 3 columnas (1 sola fila por página) -->
    <div class="opinions-grid">
      <div
        v-for="(review, index) in reviewsPaginadas"
        :key="review.id"
        class="opinion-card opinion-animate-scroll"
        :style="{ transitionDelay: `${index * 0.15}s` }"
      >
        <div class="card-glow"></div>
        <div class="stars">
          <i v-for="n in review.rating" :key="n" class="fa-solid fa-star"></i>
        </div>
        <p class="opinion-text">"{{ review.text }}"</p>
        <h4 class="opinion-author">{{ review.name }}</h4>
      </div>
    </div>

    <!-- Paginador con puntos suspensivos -->
    <div v-if="totalPaginas > 1" class="pagination-container animate-on-scroll">
      <button
        @click="cambiarPagina(paginaActual - 1)"
        :disabled="paginaActual === 1"
        class="page-btn"
      >
        &lt;
      </button>

      <template v-for="(item, idx) in paginasVisibles" :key="idx">
        <span v-if="item === '...'" class="page-dots">...</span>
        <button
          v-else
          @click="cambiarPagina(item)"
          :class="['page-btn', { active: paginaActual === item }]"
        >
          {{ item }}
        </button>
      </template>

      <button
        @click="cambiarPagina(paginaActual + 1)"
        :disabled="paginaActual === totalPaginas"
        class="page-btn"
      >
        &gt;
      </button>
    </div>
  </section>
</template>

<style scoped>
.opinions-section {
  position: relative;
  width: 100%;
  padding: 120px 20px;
  background-color: #05070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
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

/* Forzamos exactamente 3 columnas fijas en pantallas grandes */
.opinions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
  min-height: 280px; /* Evita saltos de diseño al cambiar de página */
}

/* Responsivo para tablets y celulares */
@media (max-width: 1024px) {
  .opinions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .opinions-grid {
    grid-template-columns: 1minmax(0, 1fr);
    grid-template-columns: 1fr;
  }
}

.opinion-card {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 45px 35px;
  overflow: hidden;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s ease;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
}

.opinion-card::before {
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

.opinion-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  box-shadow: 0 20px 50px rgba(0, 245, 160, 0.15);
}

.opinion-card:hover::before {
  opacity: 1;
}

.stars {
  color: #ffb800;
  font-size: 1rem;
  margin-bottom: 20px;
  display: flex;
  gap: 4px;
  text-shadow: 0 0 10px rgba(255, 184, 0, 0.3);
}

.opinion-text {
  font-size: 0.98rem;
  color: var(--text-soft, #9da3c0);
  line-height: 1.65;
  font-weight: 400;
  margin-bottom: 25px;
  flex-grow: 1;
}

.opinion-author {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-white, #ffffff);
  letter-spacing: 0.5px;
}

/* Estilos de Paginación y Puntos Suspensivos */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 50px;
  z-index: 2;
}

.page-btn {
  min-width: 38px;
  height: 38px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: var(--text-soft, #9da3c0);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(0, 245, 160, 0.1);
  border-color: rgba(0, 245, 160, 0.4);
  color: var(--text-white, #ffffff);
}

.page-btn.active {
  background: rgba(0, 245, 160, 0.15);
  border-color: var(--accent-mint, #00f5a0);
  color: var(--accent-mint, #00f5a0);
  box-shadow: 0 0 15px rgba(0, 245, 160, 0.2);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-dots {
  color: var(--text-soft, #9da3c0);
  padding: 0 4px;
  font-weight: 600;
}

.animate-on-scroll,
.opinion-animate-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1),
    transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.animate-on-scroll.is-visible,
.opinion-animate-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
