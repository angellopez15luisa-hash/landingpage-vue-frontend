<script setup lang="ts">
import { onMounted } from 'vue'

interface SocialLink {
  name: string
  url: string
  icon: string
}

interface QuickLink {
  name: string
  href: string
}

// const socialLinks: SocialLink[] = [
//   { name: 'Instagram', url: 'https://www.instagram.com/tu_empresa', icon: 'ri-instagram-line' },
//   { name: 'Facebook', url: 'https://www.facebook.com/tu_empresa', icon: 'ri-facebook-fill' },
//   { name: 'TikTok', url: 'https://www.tiktok.com/@tu_empresa', icon: 'ri-tiktok-fill' },
//   { name: 'WhatsApp', url: 'https://wa.me/51900000000', icon: 'ri-whatsapp-line' }
// ]

const socialLinks: SocialLink[] = [
  { name: 'Instagram', url: '#', icon: 'ri-instagram-line' },
  { name: 'Facebook', url: '#', icon: 'ri-facebook-fill' },
  { name: 'TikTok', url: '#', icon: 'ri-tiktok-fill' },
  { name: 'WhatsApp', url: '#', icon: 'ri-whatsapp-line' }
]

const quickLinks: QuickLink[] = [
  { name: 'Inicio', href: '#inicio' },
  { name: 'Catálogo', href: '#catalogo' },
  { name: 'Proceso', href: '#proceso' },
  { name: 'Preguntas Frecuentes', href: '#faq' }
]

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
  <footer class="footer-section" id="contacto">
    <!-- Degradado ambiental idéntico al estándar de las demás secciones -->
    <div class="section-ambient-glow"></div>

    <div class="footer-container">
      <!-- Columna 1: Información de marca -->
      <div class="footer-col animate-on-scroll">
        <h3 class="footer-logo">DROP·ZONE</h3>
        <p class="footer-description">
          Traemos lo que buscas directamente a tus manos. Importaciones rápidas, seguras y garantizadas a nivel nacional.
        </p>
        <div class="social-icons">
          <a
            v-for="social in socialLinks"
            :key="social.name"
            :href="social.url"
            class="social-btn"
            :aria-label="social.name"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i :class="social.icon"></i>
          </a>
        </div>
      </div>

      <!-- Columna 2: Enlaces rápidos -->
      <div class="footer-col animate-on-scroll" style="transition-delay: 0.15s;">
        <h4 class="footer-title">Enlaces Rápidos</h4>
        <ul class="footer-links">
          <li v-for="link in quickLinks" :key="link.name">
            <a :href="link.href" class="footer-link">{{ link.name }}</a>
          </li>
        </ul>
      </div>

      <!-- Columna 3: Contacto y Ubicación -->
      <div class="footer-col animate-on-scroll" style="transition-delay: 0.3s;">
        <h4 class="footer-title">Contacto</h4>
        <ul class="footer-contact-list">
          <li>
            <i class="ri-phone-line"></i>
            <span>+51 900 000 000</span>
          </li>
          <li>
            <i class="ri-mail-line"></i>
            <span>contacto@tumarca.com</span>
          </li>
          <li>
            <i class="ri-map-pin-line"></i>
            <span>Lima, Perú</span>
          </li>
          <li>
            <i class="ri-time-line"><span>Lunes a Sábado: 9:00 am - 7:00 pm</span></i>
          </li>
        </ul>
      </div>
    </div>

    <!-- Barra inferior de copyright -->
    <div class="footer-bottom animate-on-scroll" style="transition-delay: 0.45s;">
      <p>&copy; {{ new Date().getFullYear() }} Tu Marca. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
/* --- ESTILOS DEL FOOTER --- */
.footer-section {
  position: relative;
  width: 100%;
  padding: 100px 20px 30px;
  background-color: #05070a;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

/* Resplandor ambiental sutil y profundo */
.section-ambient-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background:
    radial-gradient(circle at 10% 90%, rgba(0, 245, 160, 0.025) 0%, transparent 40%),
    radial-gradient(circle at 90% 10%, rgba(0, 217, 245, 0.02) 0%, transparent 40%);
  pointer-events: none;
  z-index: 1;
}

.footer-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 40px;
  z-index: 2;
  padding-bottom: 60px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--text-white, #ffffff);
  letter-spacing: -0.5px;
}

.footer-description {
  color: var(--text-soft, #9da3c0);
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Redes sociales */
.social-icons {
  display: flex;
  gap: 12px;
  margin-top: 4px;
}

.social-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(14, 16, 23, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-white, #ffffff);
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: var(--border-mint, rgba(0, 245, 160, 0.15));
  border-color: var(--border-mint, rgba(0, 245, 160, 0.4));
  color: #00f5a0;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 245, 160, 0.1);
}

/* Títulos de columnas */
.footer-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-white, #ffffff);
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

/* Enlaces rápidos */
.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-link {
  color: var(--text-soft, #9da3c0);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.3s ease, transform 0.3s ease;
  display: inline-block;
}

.footer-link:hover {
  color: #00f5a0;
  transform: translateX(4px);
}

/* Lista de contacto */
.footer-contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: var(--text-soft, #9da3c0);
  font-size: 0.95rem;
}

.footer-contact-list i {
  color: #00f5a0;
  font-size: 1.1rem;
  margin-top: 2px;
}

/* Barra inferior */
.footer-bottom {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding-top: 25px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  color: var(--text-soft, #9da3c0);
  font-size: 0.85rem;
  z-index: 2;
}

/* --- SISTEMA DE ANIMACIÓN --- */
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
