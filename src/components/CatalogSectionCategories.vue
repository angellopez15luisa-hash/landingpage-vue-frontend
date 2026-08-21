<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { CatalogCategoryAction } from '@/business/actions/catalog-category.action'
import { useQuery, useQueryClient } from '@tanstack/vue-query'
import { io, Socket } from 'socket.io-client'
import type { CatalogCategory } from '@/types/catalog-category.type'

const emit = defineEmits<{ 'update:selectedCategory': [categoryId: CatalogCategory['id']] }>()

const queryClient = useQueryClient()
let socket: Socket | null = null
const selectedCategory = ref<number>(0)

const { data: catalogCategories } = useQuery({
  queryKey: ['catalog-categories'],
  queryFn: () => CatalogCategoryAction.getAll(),
  retry: false,
})

watch(
  catalogCategories,
  (categories) => {
    if (categories && Array.isArray(categories) && categories.length > 0) {
      const defaultItem = categories.find((item) => item.isDefault === true) || categories[0]
      if (defaultItem) {
        selectedCategory.value = defaultItem.id
        emit('update:selectedCategory', defaultItem.id)
      }
    }
  },
  { immediate: true },
)

const selectCategory = (id:CatalogCategory['id']) => {
  selectedCategory.value = id
  console.log(selectedCategory.value)
  emit('update:selectedCategory',id)
}

onMounted(() => {
  const SOCKET_URL = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')

  socket = io(SOCKET_URL, {
    transports: ['polling', 'websocket'],
    reconnection: true,
  })
  socket.on('catalog-category', (data) => {
    console.log('🎯 ¡Evento recibido en la Navbar!', data)
    queryClient.invalidateQueries({ queryKey: ['catalog-categories'] })
  })
})
onUnmounted(() => {
  // 4. Desconectamos el socket al desmontar el componente para evitar fugas de memoria
  if (socket) {
    socket.disconnect()
  }
})
</script>

<template>
  <div class="catalog-filters animate-on-scroll">
    <template v-for="category in catalogCategories" :key="category.id">
      <button
        v-if="category.isActive"
        class="filter-btn"
        :class="{ active: selectedCategory === category.id }"
        @click="selectCategory(category.id)"
      >
        {{ category.text }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.filter-btn.active {
  background: linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%);
  color: #0b0e14;
  border-color: transparent;
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
.animate-on-scroll {
  opacity: 0;
  transform: translateY(40px);
  transition:
    opacity 1.2s ease,
    transform 1.2s ease;
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
</style>
