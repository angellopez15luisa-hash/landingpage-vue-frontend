<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { GeneralSettingAction } from "@/business/actions/general-setting.action"
import { useQuery } from "@tanstack/vue-query"
import { ref } from 'vue'
// Estado reactivo para controlar el menú móvil
const isMenuOpen = ref<boolean>(false)

  const { data: generalSetting } = useQuery({
  queryKey: ['general-setting'],
  queryFn: () => GeneralSettingAction.get(),
  retry: false,
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}
</script>

<template>
  <div class="header-fixed">
    <nav class="island-nav">
      <a href="#inicio" class="brand-logo-link">
        <div class="brand-logo">{{ generalSetting?.textNameCompany }} www</div>
      </a>
      <button
        class="menu-toggle"
        :class="{ active: isMenuOpen }"
        @click="toggleMenu"
        aria-label="Abrir menu"
      >
        <span> </span>
        <span></span>
        <span></span>
      </button>
      <ul class="menu-items" :class="{ active: isMenuOpen }">
        <li><a href="#como-pedir" @click="closeMenu">¿Como pedir?</a></li>
        <li><a href="#catalogo" @click="closeMenu">Catalogo</a></li>
        <li><a href="#opiniones" @click="closeMenu">Opiniones</a></li>
        <li><a href="#faq" @click="closeMenu">Preguntas</a></li>
        <li><a href="#contacto" @click="closeMenu">Contacto</a></li>
      </ul>

      <a href="https://wa.me/51999999999" target="_blank" class="btn-island-ws"> {{ generalSetting?.textButtonNavbar }} </a>
    </nav>
  </div>
</template>

<style scoped>
/* --- NAVEGACION --- */
.header-fixed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  padding: 16px;
}

.island-nav {
  max-width: 1100px;
  margin: 0 auto;
  background: rgba(26, 28, 40, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-soft, rgba(255, 255, 255, 0.12));
  border-radius: 99px;
  padding: 12px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
}

.brand-logo {
  font-weight: 900;
  font-size: 1.25rem;
  letter-spacing: -0.5px;
  color: var(--text-white, #ffffff);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand-logo::before {
  content: '';
  display: inline-block;
  width: 10px;
  height: 10px;
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  border-radius: 50%;
  box-shadow: 0 0 12px var(--accent-mint, #00f5a0);
}

.menu-items {
  display: flex;
  gap: 32px;
  list-style: none;
}

.menu-items a {
  color: var(--text-muted, #9da3c0);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}
.menu-items a:hover {
  color: var(--accent-mint, #00f5a0);
}

.btn-island-ws {
  background: var(--grad-fresh, linear-gradient(135deg, #00f5a0 0%, #00d9f5 100%));
  color: #0b0e14;
  padding: 10px 22px;
  border-radius: 99px;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(0, 245, 160, 0.25);
}
.btn-island-ws:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 245, 160, 0.4);
}
.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
  z-index: 1001;
}
.menu-toggle span {
  width: 22px;
  height: 2px;
  background-color: var(--text-white, #ffffff);
  border-radius: 2px;
}

/* --- RESETEAR EL ENLACE DEL LOGO --- */
.brand-logo-link {
  text-decoration: none;
  color: inherit;
  display: inline-block;
  outline: none;
}

.brand-logo-link:hover {
  text-decoration: none;
  color: inherit;
}

/* --- RESPONSIVE MENU MOVIL (ESTLO ESCALERA) --- */

@media screen and (max-width: 868px) {
  .menu-toggle {
    display: flex;
    z-index: 1001;
  }

  .menu-items {
    position: fixed;
    top: -16px;
    left: -16px;
    width: calc(100vw + 32px);
    height: calc(100vh + 16px);

    background: rgba(12, 13, 20, 0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 0 30px;

    opacity: 0;
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 1000;
  }

  .menu-items li {
    list-style: none;
    width: 100%;
    max-width: 320px;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .menu-items li:last-child {
    border-bottom: none;
  }

  .menu-items a {
    display: block;
    padding: 20px 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: var(--text-white, #ffffff);
    letter-spacing: 2px;
    text-transform: uppercase;
    text-decoration: none;
    transition: all 0.3s ease;
  }
  .menu-items a :hover,
  .menu-items a:active {
    color: var(--accent-mint, #00f5a0);
    letter-spacing: 3px;
  }
  .menu-items li:has(a:hover),
  .menu-items li:has(a:active) {
    border-bottom-color: var(--accent-mint, #00f5a0);
    box-shadow: 0 4px 15px -5px rgba(0, 245, 160, 0.4);
  }
  .menu-items.active {
    opacity: 1;
    visibility: visible;
  }
  .menu-items.active li {
    opacity: 1;
    transform: translateY(0);
  }
  .menu-items.active li:nth-child(1) {
    transition-delay: 0.1s;
  }
  .menu-items.active li:nth-child(2) {
    transition-delay: 0.18s;
  }
  .menu-items.active li:nth-child(3) {
    transition-delay: 0.26s;
  }
  .menu-items.active li:nth-child(4) {
    transition-delay: 0.34s;
  }

  .menu-toggle.active span:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
    background-color: var(--accent-mint, #00f5a0);
  }
  .menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }
  .menu-toggle.active span:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
    background-color: var(--accent-mint, #00f5a0);
  }
}
</style>
