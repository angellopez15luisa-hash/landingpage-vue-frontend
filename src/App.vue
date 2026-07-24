<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CatalogSection from './components/CatalogSection.vue'
import HeroSlider from './components/HeroSlider.vue'
import HowToOrder from './components/HowToOrder.vue'
import Navbar from './components/Navbar.vue'
import OpinionsSection from './components/OpinionsSection.vue'
import FaqSection from './components/FaqSection.vue'
import SiteFooter from "./components/SiteFooter.vue"

const showScrollTop = ref(false)

const handleScroll = () => {
  if (window.scrollY > 400) {
    showScrollTop.value = true
  } else {
    showScrollTop.value = false
  }
}

// --- SUBIDA SUAVE Y CONTROLADA (Mantiene el scroll del mouse 100% libre) ---
const scrollToTop = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  // Obtenemos la posición actual
  const startPosition = window.pageYOffset
  if (startPosition === 0) return

  const startTime = performance.now()
  // 🎛️ AQUÍ CAMBIAS LA DURACIÓN EN MILISEGUNDOS:
  // 1000 = 1 segundo, 1400 = 1.4 segundos (más lento y elegante).
  // Al usar la API nativa con una animación temporal controlada, el navegador NUNCA bloquea el mouse.
  const duration = 1500

  const animation = (currentTime: number) => {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)

    // Curva de aceleración suave (Ease Out Cubic)
    const ease = 1 - Math.pow(1 - progress, 3)

    window.scrollTo(0, startPosition * (1 - ease))

    if (progress < 1) {
      requestAnimationFrame(animation)
    } else {
      window.scrollTo(0, 0)
    }
  }

  requestAnimationFrame(animation)
}

// --- GESTIÓN INTELIGENTE DE CLICS DEL MENÚ Y LOGO ---
const handleMenuClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const link = target.closest('a')

  if (link && link.getAttribute('href')?.startsWith('#')) {
    const hash = link.getAttribute('href')

    // Si es el logo o un enlace para subir al inicio
    if (!hash || hash === '#' || hash === '#inicio') {
      e.preventDefault()
      scrollToTop()
      return
    }

    const element = document.querySelector(hash)
    if (element) {
      e.preventDefault()

      const headerOffset = 90
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', handleMenuClick)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleMenuClick)
})
</script>

<template>
  <div class="app-container">
    <Navbar />
    <main>
      <HeroSlider />
      <HowToOrder />
      <CatalogSection />
      <OpinionsSection />
      <FaqSection />
      <SiteFooter/>
    </main>
    <!-- Botón flotante para volver arriba -->
    <transition name="fade">
      <button
        v-if="showScrollTop"
        class="scroll-top-btn"
        @click="scrollToTop"
        aria-label="Volver arriba"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </transition>
  </div>
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
/* 🔑 Suaviza y desacelera la animación de desplazamiento nativa */
html {
  scroll-behavior: smooth;

  color-scheme: dark;
}

/* Opcional para navegadores basados en Webkit/Safari */
@supports (scroll-behavior: smooth) {
  html {
    scroll-behavior: smooth;
  }
}

/* --- ESTILOS DEL BOTÓN FLOTANTE --- */
.scroll-top-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  background: rgba(26, 28, 40, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-mint, rgba(0, 245, 160, 0.4));
  color: var(--accent-mint, #00f5a0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 90;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.scroll-top-btn:hover {
  transform: translateY(-5px) scale(1.05);
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  border-color: transparent;
  box-shadow: 0 15px 40px rgba(0, 245, 160, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.4s ease,
    transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
