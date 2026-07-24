<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { catalogCategories, catalogItems } from '@/data/catalog.data'

const selectedCategory = ref('Todos')

// Estado para controlar la imagen activa del Zoom/Modal
const activeImage = ref<string | null>(null)

// Estados de Zoom y Arrastre
const zoomScale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

const openModal = (imgUrl: string) => {
  activeImage.value = imgUrl
  zoomScale.value = 1
  translateX.value = 0
  translateY.value = 0
}

const closeModal = () => {
  activeImage.value = null
  zoomScale.value = 1
  translateX.value = 0
  translateY.value = 0
}

// Lógica de arrastre con Mouse
const startDrag = (event: MouseEvent) => {
  if (zoomScale.value === 1) return
  isDragging.value = true
  startX.value = event.clientX - translateX.value
  startY.value = event.clientY - translateY.value
}

const onDrag = (event: MouseEvent) => {
  if (!isDragging.value) return
  translateX.value = event.clientX - startX.value
  translateY.value = event.clientY - startY.value
}

// Lógica de arrastre táctil (Celulares / Tablets)
const startDragTouch = (event: TouchEvent) => {
  if (zoomScale.value === 1) return
  if (event.touches.length === 1) {
    isDragging.value = true
    startX.value = event.touches[0]!.clientX - translateX.value
    startY.value = event.touches[0]!.clientY - translateY.value
  }
}

const onDragTouch = (event: TouchEvent) => {
  if (!isDragging.value || event.touches.length !== 1) return
  translateX.value = event.touches[0]!.clientX - startX.value
  translateY.value = event.touches[0]!.clientY - translateY.value
}

const stopDrag = () => {
  isDragging.value = false
}

// Zoom con la rueda del ratón
const handleWheelZoom = (event: WheelEvent) => {
  event.preventDefault()
  const zoomIntensity = 0.15

  if (event.deltaY < 0) {
    zoomScale.value = Math.min(zoomScale.value + zoomIntensity, 4)
  } else {
    zoomScale.value = Math.max(zoomScale.value - zoomIntensity, 1)
  }

  // Si regresa al zoom original, resetea la posición
  if (zoomScale.value === 1) {
    translateX.value = 0
    translateY.value = 0
  }
}

// Doble clic para hacer zoom rápido o resetear
const handleDoubleClick = () => {
  if (zoomScale.value > 1) {
    zoomScale.value = 1
    translateX.value = 0
    translateY.value = 0
  } else {
    zoomScale.value = 2.5
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
    <!-- Degradado ambiental sutil -->
    <div class="section-ambient-glow"></div>

    <!-- Encabezado de la sección -->
    <div class="section-header">
      <h2 class="section-title animate-on-scroll">CATÁLOGO EXCLUSIVO</h2>
      <p class="section-subtitle animate-on-scroll">
        Explora los drops seleccionados de la temporada
      </p>
    </div>

    <!-- Botones de filtro -->
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

    <!-- Cuadrícula de productos -->
    <div class="catalog-grid">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="product-card animate-on-scroll"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <div class="product-image-wrapper clickable-zoom" @click="openModal(item.image)">
          <img :src="item.image" :alt="item.title" class="product-img" />
          <span v-if="item.badge" class="product-badge">{{ item.badge }}</span>
          <div class="product-overlay-action">
            <a href="#contacto" class="btn-quick-order" @click.stop>Separar por WhatsApp</a>
          </div>
        </div>

        <div class="product-info">
          <span class="product-category">{{ item.category }}</span>
          <h3 class="product-title">{{ item.title }}</h3>
          <div class="product-footer">
            <span class="product-price">{{ item.price }}</span>
            <span class="product-delivery">Envío seguro</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal / Visor de imagen mejorado con Zoom y Arrastre Libre -->
    <div v-if="activeImage" class="image-modal-overlay" @click="closeModal">
      <!-- Botón de la X para cerrar -->
      <button class="close-modal-btn" @click="closeModal" aria-label="Cerrar">&times;</button>

      <div
        class="image-modal-content zoom-wrapper"
        :style="{
          transform: `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`,
          cursor: zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'pointer'
        }"
        @click.stop
        @wheel.prevent="handleWheelZoom"
        @dblclick="handleDoubleClick"
        @mousedown="startDrag"
        @mousemove="onDrag"
        @mouseup="stopDrag"
        @mouseleave="stopDrag"
        @touchstart="startDragTouch"
        @touchmove="onDragTouch"
        @touchend="stopDrag"
      >
        <img
          :src="activeImage"
          alt="Zoom del producto"
          class="zoomed-img"
          @dragstart.prevent
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/* --- ESTILOS GENERALES DEL CATÁLOGO --- */
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

.catalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

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

.product-image-wrapper {
  position: relative;
  width: 100%;
  height: 340px;
  overflow: hidden;
  background-color: #121620;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.clickable-zoom {
  cursor: pointer;
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
  pointer-events: none;
}

.product-card:hover .product-overlay-action {
  opacity: 1;
  pointer-events: auto;
}

.btn-quick-order {
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  padding: 12px 26px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 0.85rem;
  text-decoration: none;
  transform: translateY(15px);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 8px 25px rgba(0, 245, 160, 0.4);
}

.product-card:hover .btn-quick-order {
  transform: translateY(0);
}

.btn-quick-order:hover {
  transform: translateY(-2px) scale(1.05);
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
}

.product-price {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--text-white, #ffffff);
}

.product-delivery {
  font-size: 0.8rem;
  color: var(--text-soft, #9da3c0);
  font-weight: 500;
}

/* --- ESTILOS DEL MODAL / ZOOM FLOTANTE --- */
.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(5, 7, 10, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  overflow: hidden;
}

.zoom-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transform-origin: center center;
  will-change: transform;
}

.zoomed-img {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  user-select: none;
  -webkit-user-drag: none;
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

/* --- SISTEMA DE ANIMACIÓN --- */
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
