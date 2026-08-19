<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
// import { heroSlides } from '@/data/hero.data'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { useQuery } from '@tanstack/vue-query'
import { HeroSectionAction } from '@/business/actions/hero-section.action'

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
  currentSlide.value = (currentSlide.value + 1) % heroSections.value!.length
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
})

onUnmounted(() => {
  if (slideInterval) clearInterval(slideInterval)
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

      <!-- <div
        v-for="(slide, index) in heroSlides"
        :key="index"
        class="slide"
        :class="{ active: currentSlide === index }"
      >
        <img :src="slide.image" alt="Streetwear Collection" />
      </div> -->
    </div>

    <!-- Capas de sombra y brillo de fondo -->
    <div class="hero-overlay"></div>
    <div class="hero-glow"></div>

    <!-- Contenido principal alineado idéntico a la referencia -->
    <div class="hero-content" v-if="heroSections">
      <span class="drop-tag animate-text">{{ heroSections[currentSlide]!.tag }}</span>

      <h1 class="hero-title animate-text">
        {{  heroSections[currentSlide]?.title }} <span class="highlight-line">{{  heroSections[currentSlide]?.highlightText }}</span>
      </h1>

      <p class="hero-description animate-text">
        {{  heroSections[currentSlide]?.description }}
      </p>

      <a href="#catalogo" class="btn-main-action animate-text">{{
        generalSetting?.textButtonHeroSection
      }}</a>
    </div>

    <!-- Puntos indicadores de navegación inferiores -->
    <div class="slider-nav">
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
/* --- CONTENEDOR GENERAL DEL HERO --- */
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

/* --- PISTA DE IMÁGENES --- */
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

/* --- CAPAS DECORATIVAS --- */
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

/* --- CONTENIDO DE TEXTO --- */
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

.drop-tag.animate-text {
  animation-delay: 0.1s;
}
.hero-title.animate-text {
  animation-delay: 0.2s;
}
.hero-description.animate-text {
  animation-delay: 0.3s;
}
.btn-main-action.animate-text {
  animation-delay: 0.4s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Etiqueta superior con borde y fondo oscuro translúcido */
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

/* Título principal idéntico a la referencia (Robusto y con salto en A PEDIDO) */
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

/* Descripción sutil */
.hero-description {
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: var(--text-soft, #d0d5ed);
  max-width: 580px;
  margin: 0 auto 35px;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
}

/* Botón principal cyan/menta con sombra difusa */
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

/* --- INDICADORES INFERIORES --- */
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
