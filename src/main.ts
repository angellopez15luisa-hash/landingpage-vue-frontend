import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'


import { VueQueryPlugin, QueryClient } from '@tanstack/vue-query'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'

const app = createApp(App)

// Crea una instancia del cliente de Vue Query
const queryClient = new QueryClient()

// Instala el plugin en Vue
app.use(VueQueryPlugin, { queryClient })

// Registra el componente Devtools para inspeccionar peticiones
app.component('VueQueryDevtools', VueQueryDevtools)

// createApp(App).mount('#app')
app.mount('#app')
