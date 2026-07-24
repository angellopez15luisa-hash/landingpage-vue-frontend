// import { Product, Review, FaqItem } from '../types';

import type { FaqItem, Product, Review } from "@/types";

export const productsData: Product[] = [
  {
    id: '1',
    name: 'Casaca Leather Biker',
    category: 'casacas',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    sizes: ['S', 'M', 'L'],
    price: 149
  },
  {
    id: '2',
    name: 'Hoodie Heavy Cotton',
    category: 'hoodies',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80',
    sizes: ['M', 'L', 'XL'],
    price: 99
  },
  // ... más productos
];

export const reviewsData: Review[] = [
  { id: '1', author: 'Camila R.', text: 'Atención rápida por WhatsApp y la prenda llegó en excelente estado.', stars: 5 },
  { id: '2', author: 'Mateo G.', text: 'Muy buena calidad de tela y los tiempos de entrega se cumplieron.', stars: 5 }
];

export const faqData: FaqItem[] = [
  { question: '¿Cuánto demora la entrega?', answer: 'El tiempo estimado de llegada e importación es de 5 a 8 días hábiles.' },
  { question: '¿Cuáles son los medios de pago?', answer: 'Aceptamos Yape, Plin, transferencias bancarias y tarjetas.' }
];
