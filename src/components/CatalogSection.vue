<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { catalogCategories, catalogItems } from '@/data/catalog.data'

const selectedCategory = ref('Todos')

// Estado para el modal de zoom
const activeImage = ref<string | null>(null)
const scale = ref(1)
const posX = ref(0)
const posY = ref(0)
const isDragging = ref(false)

let startX = 0
let startY = 0

// Variables táctiles para celulares (Pinch to zoom y arrastre de 1 o 2 dedos)
let initialDistance = 0
let initialScale = 1

const openModal = (imgUrl: string) => {
  activeImage.value = imgUrl
  scale.value = 1
  posX.value = 0
  posY.value = 0
}

const closeModal = () => {
  activeImage.value = null
  scale.value = 1
  posX.value = 0
  posY.value = 0
}

// Alternar zoom con doble clic (PC / Móvil)
const handleDoubleClick = () => {
  if (scale.value > 1) {
    scale.value = 1
    posX.value = 0
    posY.value = 0
  } else {
    scale.value = 1.8 // Nivel de zoom al hacer doble clic
  }
}

// Zoom con la rueda del ratón (PC)
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const zoomIntensity = 0.15
  if (e.deltaY < 0) {
    scale.value = Math.min(scale.value + zoomIntensity, 4) // Máximo zoom x4
  } else {
    scale.value = Math.max(scale.value - zoomIntensity, 1) // Mínimo zoom x1
  }
  if (scale.value === 1) {
    posX.value = 0
    posY.value = 0
  }
}

// Arrastre con Mouse (PC)
const startDrag = (e: MouseEvent) => {
  if (scale.value === 1) return
  isDragging.value = true
  startX = e.clientX - posX.value
  startY = e.clientY - posY.value
}

const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  posX.value = e.clientX - startX
  posY.value = e.clientY - startY
}

const stopDrag = () => {
  isDragging.value = false
}

// --- SOPORTE TÁCTIL PARA CELULARES ---
const getDistance = (touches: TouchList) => {
  return Math.hypot(
    touches[0]!.clientX - touches[1]!.clientX,
    touches[0]!.clientY - touches[1]!.clientY,
  )
}

const handleTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Dos dedos: Preparar Zoom táctil (Pinch)
    initialDistance = getDistance(e.touches)
    initialScale = scale.value
  } else if (e.touches.length === 1 && scale.value > 1) {
    // Un dedo con zoom activo: Arrastrar imagen
    isDragging.value = true
    startX = e.touches[0]!.clientX - posX.value
    startY = e.touches[0]!.clientY - posY.value
  }
}

const handleTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 2) {
    // Mover con dos dedos (Pinch to zoom)
    e.preventDefault()
    const currentDistance = getDistance(e.touches)
    if (initialDistance > 0) {
      const factor = currentDistance / initialDistance
      scale.value = Math.min(Math.max(initialScale * factor, 1), 4)
    }
  } else if (e.touches.length === 1 && isDragging.value) {
    // Mover con un dedo con zoom activo
    posX.value = e.touches[0]!.clientX - startX
    posY.value = e.touches[0]!.clientY - startY
  }
}

const handleTouchEnd = () => {
  isDragging.value = false
  initialDistance = 0
  if (scale.value === 1) {
    posX.value = 0
    posY.value = 0
  }
}

const filteredItems = computed(() => {
  if (selectedCategory.value === 'Todos') {
    return catalogItems
  }
  return catalogItems.filter((item) => item.category === selectedCategory.value)
})

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
  <section class="catalog-container" id="catalogo">
    <!-- Degradado ambiental sutil y profundo idéntico al resto de secciones -->
    <div class="section-ambient-glow"></div>

    <!-- Encabezado de la sección -->
    <div class="section-header">
      <h2 class="section-title animate-on-scroll">CATÁLOGO EXCLUSIVO</h2>
      <p class="section-subtitle animate-on-scroll">
        Explora los drops seleccionados de la temporada
      </p>
    </div>

    <!-- Botones de filtro interactivos -->
    <div class="catalog-filters animate-on-scroll">
      <button
        v-for="category in catalogCategories"
        :key="category"
        class="filter-btn"
        :class="{ active: selectedCategory === category }"
        @click="selectedCategory = category"
      >
        {{ category }}
      </button>
    </div>

    <!-- Cuadrícula de productos con animaciones y efectos originales -->
    <div class="catalog-grid">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="product-card animate-on-scroll"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <!-- Al hacer clic en la imagen se abre el modal de zoom -->
        <div class="product-image-wrapper clickable-zoom" @click="openModal(item.image)">
          <img :src="item.image" :alt="item.title" class="product-img" />
          <span v-if="item.badge" class="product-badge">{{ item.badge }}</span>
          <div class="product-overlay-action">
            <span class="btn-zoom-preview">🔍 Ampliar Imagen</span>
          </div>
        </div>

        <div class="product-info">
          <span class="product-category">{{ item.category }}</span>
          <h3 class="product-title">{{ item.title }}</h3>
          <div class="product-footer">
            <span class="product-price">{{ item.price }}</span>
            <a href="#contacto" class="btn-quick-order" @click.stop>Separar por WhatsApp</a>
          </div>
        </div>
      </div>
    </div>

    <!-- POPUP MODAL CON ZOOM INTEGRADO Y SOPORTE MÓVIL/PC -->
    <div v-if="activeImage" class="image-modal-overlay" @click="closeModal">
      <button class="close-modal-btn" @click="closeModal" aria-label="Cerrar">&times;</button>

      <div
        class="modal-zoom-container"
        @click.stop
        @dblclick="handleDoubleClick"
        @wheel.prevent="handleWheel"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @touchstart="handleTouchStart"
        @touchmove="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <img
          :src="activeImage"
          alt="Vista ampliada del producto"
          class="modal-zoomed-img"
          :style="{
            transform: `translate(${posX}px, ${posY}px) scale(${scale})`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
          }"
          @dragstart.prevent
        />
        <div class="zoom-instructions">
          Usa la rueda del ratón o pellizca con dos dedos para hacer zoom 🔍
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- CONTENEDOR GENERAL DEL CATÁLOGO --- */
.catalog-container {
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
  margin-bottom: 40px;
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

/* --- FILTROS DE CATEGORÍA --- */
.catalog-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 50px;
  z-index: 2;
}

.filter-btn {
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: var(--text-soft, #9da3c0);
  padding: 10px 24px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.filter-btn:hover {
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  color: var(--text-white, #ffffff);
  transform: translateY(-2px);
}

.filter-btn.active {
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  border-color: transparent;
  box-shadow: 0 6px 20px rgba(0, 245, 160, 0.3);
}

/* --- CUADRÍCULA DE PRODUCTOS --- */
.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

/* Tarjeta individual con efectos originales y fondo oscuro optimizado */
.product-card {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  z-index: 2;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s ease;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  box-shadow: 0 20px 50px rgba(0, 245, 160, 0.15);
}

/* Imagen y zoom original */
.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 340px;
  overflow: hidden;
  background-color: #121620;
  cursor: pointer;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.product-card:hover .product-img {
  transform: scale(1.08);
}

.product-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(11, 14, 20, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border-mint, rgba(0, 245, 160, 0.3));
  color: var(--accent-mint, #00f5a0);
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  z-index: 3;
}

/* Overlay deslizante original modificado para el zoom */
.product-overlay-action {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(11, 14, 20, 0.55);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.product-card:hover .product-overlay-action {
  opacity: 1;
}

.btn-zoom-preview {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  padding: 10px 22px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.85rem;
  backdrop-filter: blur(6px);
  transform: translateY(15px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.product-card:hover .btn-zoom-preview {
  transform: translateY(0);
}

.product-info {
  padding: 25px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: space-between;
}

.product-category {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--accent-mint, #00f5a0);
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}

.product-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-white, #ffffff);
  margin-bottom: 18px;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 15px;
  gap: 10px;
}

.product-price {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-white, #ffffff);
}

.btn-quick-order {
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 245, 160, 0.3);
  white-space: nowrap;
}

.btn-quick-order:hover {
  transform: scale(1.05);
}

/* --- ESTILOS DEL POPUP MODAL CON ZOOM --- */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(5, 7, 10, 0.95);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
  animation: fadeInModal 0.3s ease;
}

@keyframes fadeInModal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-zoom-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  touch-action: none; /* Evita comportamientos extraños de scroll en móvil al hacer zoom */
}

.modal-zoomed-img {
  max-width: 85vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  transition: transform 0.08s ease-out;
  user-select: none;
  pointer-events: auto;
}

.zoom-instructions {
  position: absolute;
  bottom: 25px;
  background: rgba(14, 16, 23, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--text-soft, #9da3c0);
  padding: 8px 18px;
  border-radius: 99px;
  font-size: 0.75rem;
  pointer-events: none;
  backdrop-filter: blur(6px);
  letter-spacing: 0.5px;
}

.close-modal-btn {
  position: absolute;
  top: 25px;
  right: 25px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 1.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10000;
}

.close-modal-btn:hover {
  background: var(--accent-mint, #00f5a0);
  color: #0b0e14;
  border-color: transparent;
}

/* --- SISTEMA DE ANIMACIÓN SUAVE Y LENTA --- */
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
</style>
