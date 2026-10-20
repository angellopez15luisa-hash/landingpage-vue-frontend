<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import CatalogSection from './components/CatalogSection.vue'
import HeroSlider from './components/HeroSlider.vue'
import HowToOrder from './components/HowToOrder.vue'
import Navbar from './components/Navbar.vue'
import OpinionsSection from './components/OpinionsSection.vue'
import FaqSection from './components/FaqSection.vue'
import SiteFooter from "./components/SiteFooter.vue"
import ContactSection from "./components/ContactSection.vue"
import { VueQueryDevtools } from "@tanstack/vue-query-devtools"

const showScrollTop = ref(false)
const isLoading = ref(true)
const isReady = ref(false)

const handleScroll = () => {
  if (window.scrollY > 400) {
    showScrollTop.value = true
  } else {
    showScrollTop.value = false
  }
}

const scrollToTop = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }

  const startPosition = window.pageYOffset
  if (startPosition === 0) return

  const startTime = performance.now()
  const duration = 1500

  const animation = (currentTime: number) => {
    const elapsedTime = currentTime - startTime
    const progress = Math.min(elapsedTime / duration, 1)
    const ease = 1 - Math.pow(1 - progress, 3)

    window.scrollTo(0, startPosition * (1 - ease))

    if (progress < 1) {
      requestAnimationFrame(animation)
    } else {
      window.scrollTo(0, 0)
      // 🔹 Limpiamos el hash de la URL definitivamente al llegar arriba
      window.history.replaceState(null, '', window.location.pathname)
    }
  }

  requestAnimationFrame(animation)
}

const handleMenuClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const link = target.closest('a')

  if (link && link.getAttribute('href')?.startsWith('#')) {
    const hash = link.getAttribute('href')

    if (!hash || hash === '#' || hash === '#inicio') {
      e.preventDefault()
      scrollToTop()
      return
    }

    const element = document.querySelector(hash)
    if (element) {
      e.preventDefault()

      const headerOffset = 80
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

  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual'
  }

  const currentHash = window.location.hash

  if (!currentHash) {
    isLoading.value = false
    setTimeout(() => { isReady.value = true }, 50)
    return
  }

  document.body.style.overflow = 'hidden'

  const doScrollWhenLoaded = () => {
    const targetElement = document.querySelector(currentHash) as HTMLElement

    if (targetElement) {
      const headerOffset = 80
      const elementPosition = targetElement.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition > 0 ? offsetPosition : 0,
        behavior: 'instant'
      })
    }

    setTimeout(() => {
      document.body.style.overflow = ''
      isLoading.value = false
      setTimeout(() => {
        isReady.value = true
      }, 500)
    }, 500)
  }

  if (document.readyState === 'complete') {
    setTimeout(doScrollWhenLoaded, 200)
  } else {
    window.addEventListener('load', () => {
      setTimeout(doScrollWhenLoaded, 200)
    })
    setTimeout(doScrollWhenLoaded, 900)
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleMenuClick)
})
</script>

<template>
  <!-- 🔹 Spinner global fuera del contenedor principal para que su texto nunca se oculte -->
  <div v-if="isLoading" class="global-loader">
    <div class="spinner"></div>
    <p>Cargando sección...</p>
  </div>

  <div class="app-container" :class="{ 'content-ready': isReady }">
    <!-- Estructura principal -->
    <Navbar />
    <main>
      <HeroSlider />
      <HowToOrder />
      <CatalogSection />
      <OpinionsSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
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
  <VueQueryDevtools />
</template>

<style scoped>
.app-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  opacity: 0; /* Oculto mientras se calcula la posición exacta */
  transition: opacity 0.4s ease-in-out;
}

.app-container.content-ready {
  opacity: 1; /* Aparece suavemente con todo en su sitio */
}

html {
  scroll-behavior: smooth;
  color-scheme: dark;
}

/* --- ESTILOS DEL SPINNER GLOBAL --- */
.global-loader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: #05070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  z-index: 9999;
  color: var(--text-soft, #9da3c0);
  font-family: inherit;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
}

.spinner {
  width: 45px;
  height: 45px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: var(--accent-mint, #00f5a0);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
