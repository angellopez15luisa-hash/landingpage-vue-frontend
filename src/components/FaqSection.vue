<script setup lang="ts">
import { questionList } from '@/data/question.data'
import { onMounted, ref } from 'vue'

const faqList = ref(questionList)

onMounted(() => {
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

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <section class="faq-section" id="faq">
    <!-- Degradado ambiental sutil y profundo idéntico al resto de secciones -->
    <div class="section-ambient-glow"></div>

    <!-- Encabezado de la sección -->
    <div class="section-header">
      <h2 class="section-title animate-on-scroll">PREGUNTAS FRECUENTES</h2>
      <p class="section-subtitle animate-on-scroll">Resolvemos tus dudas sobre el proceso de compra e importación</p>
    </div>

    <!-- Contenedor de las cajas de FAQ -->
    <div class="faq-container">
      <div
        v-for="(faq, index) in faqList"
        :key="faq.id"
        class="faq-box animate-on-scroll"
        :style="{ transitionDelay: `${index * 0.15}s` }"
      >
        <h3 class="faq-question">{{ faq.question }}</h3>
        <p class="faq-answer">{{ faq.answer }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- ESTILOS DE LA SECCIÓN DE PREGUNTAS FRECUENTES --- */
.faq-section {
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

/* Resplandor ambiental idéntico para mantener coherencia visual */
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
  margin-bottom: 50px;
  z-index: 2;
}

.section-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  color: var(--text-white, #ffffff);
  text-transform: uppercase;
  letter-spacing: -1px;
  margin-bottom: 12px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-soft, #9da3c0);
  font-weight: 500;
}

/* Contenedor principal de FAQ */
.faq-container {
  max-width: 850px;
  width: 100%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 2;
}

/* Tarjeta individual de FAQ con fondo oscuro optimizado y efectos exactos */
.faq-box {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 26px 30px;
  overflow: hidden;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
}

.faq-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 245, 160, 0.04) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.faq-box:hover {
  transform: translateY(-4px);
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  box-shadow: 0 20px 40px rgba(0, 245, 160, 0.12);
}

.faq-box:hover::before {
  opacity: 1;
}

/* Pregunta */
.faq-question {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-white, #ffffff);
  margin-bottom: 8px;
  letter-spacing: 0.3px;
}

/* Respuesta */
.faq-answer {
  color: var(--text-soft, #9da3c0);
  font-size: 0.95rem;
  line-height: 1.6;
  font-weight: 400;
}

/* --- SISTEMA DE ANIMACIÓN SUAVE Y LENTA --- */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 1.2s cubic-bezier(0.25, 1, 0.5, 1), transform 1.2s cubic-bezier(0.25, 1, 0.5, 1);
}

.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
