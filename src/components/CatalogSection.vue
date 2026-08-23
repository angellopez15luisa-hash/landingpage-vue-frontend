<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed, onUnmounted } from 'vue'
import VueEasyLightbox from 'vue-easy-lightbox'
// import { catalogItems } from "@/data/catalog.data.ts"
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
const currentPage = ref(1)
const itemsPerPage = ref(6)

// 🔹 Consumimos la data directamente de TanStack Query
const { data: catalogItems } = useQuery({
  queryKey: ['catalog-items'],
  queryFn: () => CatalogItemAction.getAll(),
  retry: false,
})

const filteredItems = computed(() => {
  const items = catalogItems.value ?? []
  if (!selectedCategory.value || selectedCategory.value === 1) {
    return items
  }
  return items.filter((item) => item.catalogCategoryId === selectedCategory.value)
})

// 🔹 Computada para cortar solo los elementos de la página actual
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredItems.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / itemsPerPage.value) || 1
})

// 🔹 Al cambiar de categoría o de datos, regresamos siempre a la página 1
watch(selectedCategory, () => {
  currentPage.value = 1
})

watch(
  catalogItems,
  () => {
    currentPage.value = 1
  },
  { once: true },
)

// 🔹 Único watch encargado de manejar la animación de los elementos paginados y filtrados
watch(
  paginatedItems,
  () => {
    const cards = document.querySelectorAll('.product-card')
    cards.forEach((el) => {
      el.classList.remove('is-visible')
    })

    nextTick(() => {
      const newCards = document.querySelectorAll('.product-card')
      newCards.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('is-visible')
        }, index * 100)
      })
    })
  },
  { deep: true, immediate: true },
)

const showSingleImage = (imgUrl: CatalogItem['imagePath']) => {
  imgsRef.value = [imgUrl!]
  indexRef.value = 0
  visibleRef.value = true
}

const onHide = () => {
  visibleRef.value = false
}

// 🔹 Paginador inteligente con puntos suspensivos
const displayedPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2 // Cuántas páginas mostrar a los lados de la actual
  const range: (number | string)[] = []
  const rangeWithDots: (number | string)[] = []
  let l: number | undefined = undefined

  range.push(1)

  for (let i = current - delta; i <= current + delta; i++) {
    if (i < total && i > 1) {
      range.push(i)
    }
  }

  if (total > 1) {
    range.push(total)
  }

  // Agregamos los puntos suspensivos donde falten saltos
  for (const i of range) {
    if (l !== undefined) {
      if (typeof i === 'number' && typeof l === 'number') {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l > 2) {
          rangeWithDots.push('...')
        }
      }
    }
    rangeWithDots.push(i)
    // Forzamos que l sea number si i es number, o lo manejamos seguro
    if (typeof i === 'number') {
      l = i
    }
  }

  return rangeWithDots
})

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

onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })
  socket.on('catalog-item', async (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    await queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
    queryClient.refetchQueries({ queryKey: ['catalog-items'] })
  })

  initObserver()
})

onUnmounted(() => {
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
      <!-- 🔹 CORREGIDO: Usamos paginatedItems en lugar de filteredItems -->
      <div
        v-for="(item, index) in paginatedItems"
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

    <!-- 🔹 Controles de Paginación Inteligente -->
    <div v-if="totalPages > 1" class="catalog-pagination">
      <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage--">
        ← Anterior
      </button>

      <div class="pagination-numbers">
        <template v-for="(page, index) in displayedPages" :key="index">
          <!-- Si es un número, pintamos el botón normal -->
          <button
            v-if="page !== '...'"
            class="page-number-btn"
            :class="{ active: page === currentPage }"
            @click="currentPage = Number(page)"
          >
            {{ page }}
          </button>

          <!-- Si es '...', pintamos un span decorativo sin evento -->
          <span v-else class="pagination-dots">...</span>
        </template>
      </div>

      <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage++">
        Siguiente →
      </button>
    </div>

    <!-- Componente oficial de la librería para el Zoom/Lightbox -->
    <vue-easy-lightbox :visible="visibleRef" :imgs="imgsRef" :index="indexRef" @hide="onHide" />
  </section>
</template>

<style scoped>
/* Tus estilos se quedan exactamente igual */
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 350px));
  justify-content: center;
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
  max-width: 350px;
  margin: 0 auto;
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
.catalog-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-top: 50px;
  z-index: 2;
}

.pagination-btn {
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  padding: 10px 20px;
  border-radius: 99px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  border-color: rgba(0, 245, 160, 0.5);
  color: #00f5a0;
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.page-number-btn {
  width: 40px;
  height: 40px;
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #9da3c0;
  border-radius: 50%;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number-btn:hover {
  color: #ffffff;
  border-color: rgba(255, 255, 255, 0.3);
}

.page-number-btn.active {
  background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%);
  color: #0b0e14;
  border-color: transparent;
}
.pagination-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 40px;
  color: #9da3c0;
  font-weight: 700;
  font-size: 1rem;
}
</style>
