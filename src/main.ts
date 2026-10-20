import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'


import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

// Importar Vue3Toastify y sus estilos
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

// Crea una instancia del cliente de Vue Query
// Crear una instancia con opciones personalizadas
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Considerar datos "frescos" por 5 minutos
      refetchOnWindowFocus: false, // No recargar la petición cada vez que cambias de pestaña
    },
  },
})

// Instala el plugin en Vue
app.use(VueQueryPlugin, { queryClient })

// Registra el componente Devtools para inspeccionar peticiones
app.component('VueQueryDevtools', VueQueryDevtools)

// Registrar plugin globalmente
app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'dark', // Cambia a 'dark' para que combine perfecto con tu diseño glassmorphism
  position: 'top-right',
} as ToastContainerOptions)

// createApp(App).mount('#app')
app.mount('#app')
