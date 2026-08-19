<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { HeroSectionAction } from '@/business/actions/hero-section.action'
import { io, Socket } from 'socket.io-client'

// 1. Instanciamos el queryClient para invalidar la caché
const queryClient = useQueryClient()
let socket: Socket | null = null

// Índice reactivo del slide actual
const currentSlide = ref(0)
let slideInterval: number | null = null

const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

const { data: heroSections } = useQuery({
  queryKey: ['hero-sections'],
  queryFn: () => HeroSectionAction.getAll(),
  retry: false,
})

const nextSlide = () => {
  if (heroSections.value && heroSections.value.length > 0) {
    currentSlide.value = (currentSlide.value + 1) % heroSections.value.length
  }
}

const goToSlide = (index: number) => {
  if (slideInterval) clearInterval(slideInterval)
  currentSlide.value = index
  startInterval()
}

const startInterval = () => {
  slideInterval = window.setInterval(nextSlide, 5000)
}

onMounted(() => {
  startInterval()

  // 2. Conexión al socket usando la variable de entorno de tu API URL (o tu puerto de backend)
  // Asegúrate de que la URL apunte a la raíz de tu backend (sin el /api si el socket corre en el puerto general)
  // socket = io(import.meta.env.VITE_API_URL || 'http://localhost:4700')

  socket = io('https://landingpage-admin-backend.onrender.com', {
  transports: ['polling', 'websocket'], // Obliga a iniciar por HTTP polling que es más tolerante
  reconnection: true,                  // Permite reintentar si Render está despertando
  reconnectionAttempts: 5,             // Intentos máximos
  reconnectionDelay: 2000,             // Espera 2 segundos entre cada intento
})

  // 3. Escuchamos el evento que emite tu backend cuando cambian los hero sections
  // (Cambia 'hero-changed' por el nombre del evento exacto que configuraste en tu backend)
  socket.on('hero-section', (data) => {
    console.log('[Socket] Cambio detectado en Hero:', data)
    // Invalidamos la query para que TanStack traiga los nuevos datos automáticamente
    queryClient.invalidateQueries({ queryKey: ['hero-sections'] })
  })
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
  // 4. Desconectamos el socket al desmontar el componente para evitar fugas de memoria
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <header class="hero-slider-container" id="inicio">
    <!-- Pista de imágenes rotativas -->
    <div class="slider-track">
      <div
        v-for="(slide, index) in heroSections"
        :key="slide.id"
        class="slide"
        :class="{ active: currentSlide === index }"
      >
        <img :src="slide.imagePath" alt="Streetwear Collection" />
      </div>
    </div>

    <!-- Capas de sombra y brillo de fondo -->
    <div class="hero-overlay"></div>
    <div class="hero-glow"></div>

    <!-- Contenido principal alineado idéntico a la referencia -->
    <div class="hero-content" v-if="heroSections && heroSections.length > 0">
      <span class="drop-tag animate-text">{{ heroSections[currentSlide]?.tag }}</span>

      <h1 class="hero-title animate-text">
        {{ heroSections[currentSlide]?.title }} <span class="highlight-line">{{ heroSections[currentSlide]?.highlightText }}</span>
      </h1>

      <p class="hero-description animate-text">
        {{ heroSections[currentSlide]?.description }}
      </p>

      <a href="#catalogo" class="btn-main-action animate-text">{{
        generalSetting?.textButtonHeroSection
      }}</a>
    </div>

    <!-- Puntos indicadores de navegación inferiores -->
    <div class="slider-nav" v-if="heroSections">
      <div
        v-for="(value, index) in heroSections"
        :key="value.id"
        class="slider-dot"
        :class="{ active: currentSlide === index }"
        @click="goToSlide(index)"
      ></div>
    </div>
  </header>
</template>

<style scoped>
/* --- Tus estilos originales se mantienen exactamente igual --- */
.hero-slider-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  overflow: hidden;
}

.slider-track {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide.active {
  opacity: 1;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center center;
  filter: brightness(0.75) contrast(1.05);
  transform: scale(1);
  transition: transform 6s cubic-bezier(0.25, 1, 0.5, 1);
}

.slide.active img {
  transform: scale(1.12);
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  background:
    radial-gradient(circle at center, transparent 20%, rgba(11, 14, 20, 0.6) 100%),
    linear-gradient(
      to bottom,
      rgba(11, 14, 20, 0.4) 0%,
      rgba(11, 14, 20, 0.2) 60%,
      var(--bg-main) 100%
    );
}

.hero-glow {
  position: absolute;
  width: 750px;
  height: 750px;
  background: radial-gradient(
    circle,
    rgba(0, 245, 160, 0.2) 0%,
    rgba(0, 217, 245, 0.1) 50%,
    transparent 70%
  );
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  pointer-events: none;
  filter: blur(80px);
}

.hero-content {
  position: relative;
  z-index: 3;
  text-align: center;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.animate-text {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s forwards ease-out;
}

.drop-tag.animate-text { animation-delay: 0.1s; }
.hero-title.animate-text { animation-delay: 0.2s; }
.hero-description.animate-text { animation-delay: 0.3s; }
.btn-main-action.animate-text { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.drop-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(18, 22, 33, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-mint, rgba(0, 245, 160, 0.3));
  color: var(--accent-mint, #00f5a0);
  padding: 8px 22px;
  border-radius: 99px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: clamp(2.3rem, 5.5vw, 4.8rem);
  font-weight: 900;
  line-height: 1.05;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin-bottom: 20px;
  color: var(--text-white, #ffffff);
  text-shadow: 0 4px 25px rgba(0, 0, 0, 0.5);
}

.hero-title .highlight-line {
  display: inline-block;
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-description {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: var(--text-soft, #d0d5ed);
  max-width: 580px;
  margin: 0 auto 35px;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

.btn-main-action {
  position: relative;
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  padding: 16px 40px;
  border-radius: 99px;
  text-decoration: none;
  font-weight: 900;
  font-size: 0.85rem;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(0, 245, 160, 0.35);
  transition: all 0.3s ease;
  display: inline-block;
}

.btn-main-action:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(0, 245, 160, 0.5);
}

.slider-nav {
  position: absolute;
  bottom: 35px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  display: flex;
  gap: 10px;
}

.slider-dot {
  width: 35px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.4s ease;
}

.slider-dot.active {
  background: var(--accent-mint, #00f5a0);
  width: 55px;
  box-shadow: 0 0 12px var(--accent-mint, #00f5a0);
}
</style>
