<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// import {  catalogItems } from '@/data/catalog.data'
import VueEasyLightbox from 'vue-easy-lightbox'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { GeneralSettingAction } from '@/business/actions/general-setting.action'
import { CatalogCategoryAction } from '@/business/actions/catalog-category.action'
import { io, Socket } from 'socket.io-client'
import { CatalogItemAction } from '../business/actions/catalog-item.action';

const queryClient = useQueryClient()
let socket: Socket | null = null

const selectedCategory = ref<number>(0)

// Estados para vue-easy-lightbox
const visibleRef = ref(false)
const imgsRef = ref<string[]>([])
const indexRef = ref(0)

const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

const { data: catalogCategories } = useQuery({
  queryKey: ['catalog-categories'],
  queryFn: () => CatalogCategoryAction.getAll(),
  retry: false,
})

const { data: catalogItems } = useQuery({
  queryKey: ['catalog-items'],
  queryFn: () => CatalogItemAction.getAll(),
  retry: false,
})


const showSingleImage = (imgUrl: string) => {
  imgsRef.value = [imgUrl]
  indexRef.value = 0
  visibleRef.value = true
}

const onHide = () => {
  visibleRef.value = false
}

const filteredItems = computed(() => {
  if (selectedCategory.value === 1) {
    return catalogItems.value
  }
  return catalogItems.value?.filter((item) => item.catalogCategoryId === selectedCategory.value)
})

// Observamos catalogCategories y cuando tenga datos, buscamos el isDefault
watch(
  catalogCategories,
  (categories) => {
    if (categories && categories.length > 0) {
      const defaultItem = categories.find((item) => item.isDefault)
      if (defaultItem) {
        selectedCategory.value = defaultItem.id
      }
    }
  },
  { immediate: true }, // { immediate: true } hace que se ejecute apenas el componente se monta por si la data ya estuviera en caché
)

onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })

  socket.on('general-setting', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['general-setting'] })
  })

  socket.on('catalog-category', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })
    // queryClient.invalidateQueries({ queryKey: ['item-sections'] })
  })

   socket.on('catalog-item', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['catalog-items'] })
    // queryClient.invalidateQueries({ queryKey: ['item-sections'] })
  })

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
    <div class="section-ambient-glow"></div>

    <div class="section-header">
      <h2 class="section-title animate-on-scroll">{{ generalSetting?.textTitleCatalogItem }}</h2>
      <p class="section-subtitle animate-on-scroll">
        {{ generalSetting?.textSubtitleCatalogItem }}
      </p>
    </div>

    <!-- Contenedor con mayor ancho para permitir ~8 o más botones por fila -->
    <div class="catalog-filters animate-on-scroll">
      <template v-for="category in catalogCategories" :key="category.id">
        <button
          v-if="category.isActive"
          class="filter-btn"
          :class="{ active: selectedCategory === category.id }"
          @click="selectedCategory = category.id"
        >
          {{ category.text }}
        </button>
      </template>
    </div>

    <div class="catalog-grid">
      <!-- v-for="(item, index) in filteredItems" -->
      <div
      v-for="(item, index) in filteredItems"
        :key="item.id"
        class="product-card animate-on-scroll"
        :style="{ transitionDelay: `${index * 0.1}s` }"
      >
        <!-- Al hacer clic llama a la función que abre el lightbox -->
        <div class="product-image-wrapper clickable-zoom" @click="showSingleImage(item.imagePath!)">
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
.section-header {
  text-align: center;
  margin-bottom: 40px;
  z-index: 2;
}
.section-title {
  font-size: clamp(2rem, 4.5vw, 3.2rem);
  font-weight: 900;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: -1px;
  margin-bottom: 12px;
}
.section-subtitle {
  font-size: 1.05rem;
  color: #9da3c0;
  font-weight: 500;
}
.catalog-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 50px;
  z-index: 2;
  max-width: 1150px; /* 🔹 Ampliado a 1150px para dar espacio a más elementos por fila de forma centrada */
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
}
.filter-btn {
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #9da3c0;
  padding: 9px 20px; /* 🔹 Padding ligeramente optimizado para que quepan más fluidos */
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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
