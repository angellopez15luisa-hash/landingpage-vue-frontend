<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
// 🔹 Importamos componentes y acciones
import CatalogSectionTitles from './CatalogSectionTitles.vue'
import CatalogSectionCategories from './CatalogSectionCategories.vue'
import { CatalogItemAction } from '@/business/actions/catalog-item.action.ts'
import type { CatalogItem } from '@/types/catalog-item.type.ts'
import type { CatalogCategory } from '@/types/catalog-category.type.ts'
import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
const queryClient = useQueryClient()
// Estados para vue-easy-lightbox
const visibleRef = ref(false)
const imgsRef = ref<string[]>([])
const indexRef = ref(0)
const selectedCategory = ref<CatalogCategory['id']>(0)

// 🔹 Consumimos la data directamente de TanStack Query
const { data: catalogItems } = useQuery({
  queryKey: ['catalog-items'],
  queryFn: () => CatalogItemAction.getAll(),
  retry: false,
})

const filteredItems = computed(() => {
  const items = catalogItems.value ?? []
   console.log(selectedCategory.value)
  if (!selectedCategory.value || selectedCategory.value === 1) {
    return items
  }
  return items.filter((item) => item.catalogCategoryId === selectedCategory.value)
})

// 2. ¡MUY IMPORTANTE! Agrega este watch para que cuando el filtro cambie,
// el Observer vuelva a detectar las tarjetas recién pintadas
watch(
  filteredItems,
  () => {
    // 1. Quitamos la clase 'is-visible' de todas las tarjetas antes de que cambien
    // Esto hace que se oculten instantáneamente al cambiar el filtro
    const cards = document.querySelectorAll('.product-card')
    cards.forEach((el) => {
      el.classList.remove('is-visible')
    })

    // 2. Esperamos a que Vue termine de renderizar el nuevo filtro
    nextTick(() => {
      // 3. Volvemos a inicializar tu observer o simplemente dejamos que el observer
      // original las detecte. Si tienes una función initObserver(), llámala aquí:
      if (typeof initObserver === 'function') {
        initObserver()
      } else {
        // O si quieres que aparezcan solas con un pequeño retraso natural:
        const newCards = document.querySelectorAll('.product-card')
        newCards.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('is-visible')
          }, index * 100) // 👈 Esto le da ese efecto de "cascada" suave que tenías
        })
      }
    })
  },
  { deep: true }
)


const showSingleImage = (imgUrl: CatalogItem['imagePath']) => {
  imgsRef.value = [imgUrl!]
  indexRef.value = 0
  visibleRef.value = true
}

const onHide = () => {
  visibleRef.value = false
}

// 🔹 Función para inicializar o refrescar el Observer de las animaciones
const initObserver = () => {
  nextTick(() => {
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
}

// 🔹 Cada vez que la data de los items cambie y se renderice, re-activamos el observer
watch(
  catalogItems,
  () => {
    initObserver()
  },
  { deep: true, immediate: true },
)

onMounted(() => {

  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })
  socket.on('catalog-item', async(data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    // Invalidamos y forzamos un refetch inmediato de los items del catálogo
  await queryClient.invalidateQueries({ queryKey: ['catalog-items'] })

  // O mejor aún, si tienes la instancia de la query o quieres forzar el refetch de esa key:
  queryClient.refetchQueries({ queryKey: ['catalog-items'] })
  })


  initObserver()
})

onUnmounted(() => {
  // 4. Desconectamos el socket al desmontar el componente para evitar fugas de memoria
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <section class="catalog-container" id="catalogo">
    <div class="section-ambient-glow"></div>

    <!-- 🔹 Componente hijo de títulos -->
    <CatalogSectionTitles />

    <CatalogSectionCategories @update:selected-category="(id) => (selectedCategory = id)" />

    <div class="catalog-grid">
      <div
        v-for="(item, index) in filteredItems"
        :key="item.id"
        class="product-card animate-on-scroll"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <!-- Al hacer clic llama a la función que abre el lightbox -->
        <div class="product-image-wrapper clickable-zoom" @click="showSingleImage(item.imagePath)">
          <img :src="item.imagePath" :alt="item.title" class="product-img" />
          <span v-if="item.badge" class="product-badge">{{ item.badge }}</span>
          <div class="product-overlay-action">
            <span class="btn-zoom-preview">🔍 Ampliar Imagen</span>
          </div>
        </div>

        <div class="product-info">
          <span class="product-category">{{ item.catalogCategory?.text }}</span>
          <h3 class="product-title">{{ item.title }}</h3>
          <div class="product-footer">
            <span class="product-price">{{ item.price }}</span>
            <a href="#contacto" class="btn-quick-order" @click.stop>Separar por WhatsApp</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Componente oficial de la librería para el Zoom/Lightbox -->
    <vue-easy-lightbox :visible="visibleRef" :imgs="imgsRef" :index="indexRef" @hide="onHide" />
  </section>
</template>

<style scoped>
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
.catalog-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 50px;
  z-index: 2;
  max-width: 1150px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}
.filter-btn {
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #9da3c0;
  padding: 9px 20px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}
.filter-btn.active {
  background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%);
  color: #0b0e14;
  border-color: transparent;
}
.catalog-grid {
  display: grid;
  /* 🔹 Cambiamos auto-fit por auto-fill y acotamos el tamaño máximo de la columna */
  grid-template-columns: repeat(auto-fill, minmax(300px, 350px));
  justify-content: center; /* 🔹 Esto centra las tarjetas hermosamente si hay pocas */
  gap: 30px;
  width: 100%;
  max-width: 1200px;
  z-index: 2;
}

.product-card {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  overflow: hidden;
  z-index: 2;
  display: flex;
  flex-direction: column;
  transition: transform 0.4s ease;
  width: 100%;
  max-width: 350px; /* 🔹 Le ponemos un tope estricto de ancho máximo */
  margin: 0 auto;   /* 🔹 La centra automáticamente si está sola */
}
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
  transition: transform 0.6s ease;
}
.product-card:hover .product-img {
  transform: scale(1.08);
}
.product-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(11, 14, 20, 0.85);
  border: 1px solid rgba(0, 245, 160, 0.3);
  color: #00f5a0;
  padding: 5px 14px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 3;
}
.product-overlay-action {
  position: absolute;
  inset: 0;
  background: rgba(11, 14, 20, 0.55);
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
  color: #00f5a0;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.product-title {
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffffff;
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
  color: #ffffff;
}
.btn-quick-order {
  background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%);
  color: #0b0e14;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 800;
  font-size: 0.75rem;
  text-decoration: none;
}
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s ease,
    transform 1.2s ease;
}
.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
