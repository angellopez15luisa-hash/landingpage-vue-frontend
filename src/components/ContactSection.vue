<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { toTypedSchema } from '@vee-validate/yup'
import axios from 'axios'
import { useMutation } from '@tanstack/vue-query'
import { toast } from 'vue3-toastify'

const showSuccessModal = ref(false)

// 1. Esquema de validación con Yup
const schema = toTypedSchema(
  yup.object({
    name: yup
      .string()
      .trim()
      .required('* El nombre completo es obligatorio')
      .min(3, '* El nombre debe tener al menos 3 caracteres'),
    email: yup
      .string()
      .trim()
      .required('* El correo electrónico es obligatorio')
      .email('* Ingresa un correo electrónico válido'),
    phone: yup
      .string()
      .trim()
      .required('* El teléfono es obligatorio')
      .matches(/^(\+?\d{1,4}[-.\s]?)?\d{7,14}$/, '* Ingresa un número de teléfono válido'),
    message: yup
      .string()
      .trim()
      .required('* El mensaje es obligatorio')
      .min(10, '* El mensaje debe tener al menos 10 caracteres'),
  }),
)

// 2. Inicializar formulario
const { handleSubmit, resetForm } = useForm({
  validationSchema: schema,
})

// 3. Vincular campos
const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: phone, errorMessage: phoneError } = useField<string>('phone')
const { value: message, errorMessage: messageError } = useField<string>('message')

// 4. MUTACIÓN CON VUE QUERY 🚀
const contactMutation = useMutation({
  mutationFn: async (formData: { name: string; email: string; phone: string; message: string }) => {
    const API_URL = import.meta.env.VITE_API_URL
    const response = await axios.post(`${API_URL}/contact-sections/send-email`, formData)
    return response.data
  },
  onSuccess: (data) => {
    const successMsg = data?.message || data?.text || '¡Mensaje enviado con éxito!'

    toast.success(successMsg, {
      theme: 'colored',
    })
    resetForm() // Limpia el formulario
  },
  onError: (error: any) => {
    const msg = error.response?.data?.message || 'Error al enviar el mensaje'
    toast.error(msg, {
      theme: 'colored',
    })
  },
})

// 5. Submit que dispara la mutación
const onSubmit = handleSubmit((values) => {
  contactMutation.mutate(values)
})

// Observer para animaciones idéntico al de las demás secciones
onMounted(async () => {
  await nextTick()

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
  <section id="contacto" class="contact-section">
    <!-- Degradado ambiental -->
    <div class="section-ambient-glow"></div>

    <div class="contact-container">
      <!-- Encabezado -->
      <div class="section-header">
        <h2 class="section-title animate-on-scroll">CONTÁCTANOS</h2>
        <p class="section-subtitle animate-on-scroll">
          Escríbenos directamente o visítanos para resolver tus dudas sobre tu pedido
        </p>
      </div>

      <div class="contact-grid">
        <!-- Columna Izquierda: Formulario de Contacto con VeeValidate -->
        <div class="card-glass form-card animate-on-scroll" style="transition-delay: 0.15s">
          <h3 class="card-title">Enviarnos un mensaje</h3>

          <form @submit.prevent="onSubmit" class="contact-form" novalidate>
            <!-- Campo Nombre -->
            <div class="form-group">
              <label for="name">Nombre completo</label>
              <input
                id="name"
                v-model="name"
                type="text"
                placeholder="Ej. Juan Pérez"
                :class="{ 'has-error': nameError }"
              />
              <span v-if="nameError" class="error-text">{{ nameError }}</span>
            </div>

            <!-- Campo Correo -->
            <div class="form-group">
              <label for="email">Correo electrónico</label>
              <input
                id="email"
                v-model="email"
                type="email"
                placeholder="ejemplo@correo.com"
                :class="{ 'has-error': emailError }"
              />
              <span v-if="emailError" class="error-text">{{ emailError }}</span>
            </div>

            <!-- Campo Teléfono -->
            <div class="form-group">
              <label for="phone">Teléfono / WhatsApp</label>
              <input
                id="phone"
                v-model="phone"
                type="tel"
                placeholder="+51 900 000 000"
                :class="{ 'has-error': phoneError }"
              />
              <span v-if="phoneError" class="error-text">{{ phoneError }}</span>
            </div>

            <!-- Campo Mensaje -->
            <div class="form-group">
              <label for="message">Mensaje</label>
              <textarea
                id="message"
                v-model="message"
                rows="4"
                placeholder="¿En qué te podemos ayudar?"
                :class="{ 'has-error': messageError }"
              ></textarea>
              <span v-if="messageError" class="error-text">{{ messageError }}</span>
            </div>

            <button type="submit" class="btn-submit" :disabled="contactMutation.isPending.value">
              <span v-if="!contactMutation.isPending.value">Enviar Mensaje 🚀</span>
              <span v-else>Enviando...</span>
            </button>
          </form>

          <p v-if="showSuccessModal" class="success-msg">
            ¡Gracias por escribirnos! Te responderemos muy pronto.
          </p>
        </div>

        <!-- Columna Derecha: Mapa + Información -->
        <div class="card-glass map-card animate-on-scroll" style="transition-delay: 0.3s">
          <h3 class="card-title">Nuestra Ubicación</h3>

          <div class="map-wrapper">
            <iframe
              title="Ubicación DropZone"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d249673.71536767742!2d-77.1278636402327!3d-12.026267600867087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c5f619ee3ec7%3A0x14206cb9cc452e4a!2sLima!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
              width="100%"
              height="100%"
              style="border: 0"
              allowfullscreen="true"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div class="info-list">
            <div class="info-item">
              <span class="info-icon">📍</span>
              <div>
                <strong>Dirección:</strong>
                <p>Lima, Perú</p>
              </div>
            </div>

            <div class="info-item">
              <span class="info-icon">⏰</span>
              <div>
                <strong>Horario de atención:</strong>
                <p>Lunes a Sábado: 9:00 am - 7:00 pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact-section {
  position: relative;
  width: 100%;
  padding: 70px 20px 120px; /* 👈 70px arriba para que el título suba más */
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

.contact-container {
  max-width: 1100px;
  width: 100%;
  margin: 0 auto;
  z-index: 2;
}

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

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: stretch;
  z-index: 2;
}

.card-glass {
  position: relative;
  background: rgba(14, 16, 23, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    transform 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.4s ease;
}

.card-glass::before {
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

.card-glass:hover {
  transform: translateY(-4px);
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  box-shadow: 0 20px 40px rgba(0, 245, 160, 0.12);
}

.card-glass:hover::before {
  opacity: 1;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-white, #ffffff);
  margin-bottom: 24px;
  letter-spacing: 0.3px;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
  flex: 1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.form-group label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-soft, #9da3c0);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea {
  background: rgba(8, 10, 15, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--accent-mint, #00f5a0);
  box-shadow: 0 0 10px rgba(0, 245, 160, 0.2);
}

.form-group input.has-error,
.form-group textarea.has-error {
  border-color: #ff5252;
  box-shadow: 0 0 10px rgba(255, 82, 82, 0.2);
}

.error-text {
  color: #ff5252;
  font-size: 0.78rem;
  font-weight: 600;
  margin-top: 2px;
}

.btn-submit {
  margin-top: auto;
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 4px 15px rgba(0, 245, 160, 0.25);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 245, 160, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-msg {
  margin-top: 15px;
  color: var(--accent-mint, #00f5a0);
  font-weight: 700;
  text-align: center;
  font-size: 0.88rem;
}

.map-card {
  display: flex;
  flex-direction: column;
}

.map-wrapper {
  width: 100%;
  flex: 1;
  min-height: 250px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  margin-bottom: 20px;
  filter: grayscale(80%) invert(90%) hue-rotate(180deg) contrast(90%);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: auto;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.info-item strong {
  display: block;
  font-size: 0.85rem;
  color: #ffffff;
}

.info-item p {
  font-size: 0.85rem;
  color: var(--text-soft, #9da3c0);
  margin: 0;
}

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

@media screen and (max-width: 868px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
