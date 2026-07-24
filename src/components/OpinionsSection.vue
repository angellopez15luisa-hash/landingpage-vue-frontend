<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'
import { reviewsData } from '../data/reviews.data'

const reviews = ref(reviewsData)

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
  <section class="opinions-section" id="opiniones">
    <!-- Degradado ambiental sutil y profundo idéntico al resto de secciones -->
    <div class="section-ambient-glow"></div>

    <!-- Encabezado de la sección -->
    <div class="section-header">
      <h2 class="section-title animate-on-scroll">OPINIONES DE CLIENTES</h2>
      <p class="section-subtitle animate-on-scroll">Lo que dicen quienes ya confiaron en nosotros</p>
    </div>

    <!-- Contenedor de las tarjetas de opiniones -->
    <div class="opinions-grid">
      <div
        v-for="(review, index) in reviews"
        :key="review.id"
        class="opinion-card animate-on-scroll"
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
  </section>
</template>

<style scoped>
/* --- ESTILOS DE LA SECCIÓN DE OPINIONES --- */
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
.opinions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

/* Tarjeta individual con fondo oscuro optimizado y efectos exactos */
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
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
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

/* Estrellas */
.stars {
  color: #ffb800;
  font-size: 1rem;
  margin-bottom: 20px;
  display: flex;
  gap: 4px;
  text-shadow: 0 0 10px rgba(255, 184, 0, 0.3);
}

/* Texto de la opinión */
.opinion-text {
  font-size: 0.98rem;
  color: var(--text-soft, #9da3c0);
  line-height: 1.65;
  font-weight: 400;
  margin-bottom: 25px;
  flex-grow: 1;
}

/* Autor */
.opinion-author {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-white, #ffffff);
  letter-spacing: 0.5px;
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
