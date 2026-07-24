import type { CatalogItem } from '@/types'

export const catalogCategories: string[] = ['Todos', 'Hoodies', 'Pantalones', 'Polos', 'Sets']

export const catalogItems: CatalogItem[] = [
  {
    id: 1,
    title: 'Oversized Cyber Hoodie',
    category: 'Hoodies',
    price: '$65.00',
    image:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    badge: 'Más Vendido',
  },
  {
    id: 2,
    title: 'Cargo Techwear Pants',
    category: 'Pantalones',
    price: '$75.00',
    image:
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=800&q=80',
    badge: 'Nuevo',
  },
  {
    id: 3,
    title: 'Graphic Acid Tee',
    category: 'Polos',
    price: '$35.00',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 4,
    title: 'Streetwear Matching Set',
    category: 'Sets',
    price: '$110.00',
    image:
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    badge: 'Exclusivo',
  },
  {
    id: 5,
    title: 'Minimalist Urban Hoodie',
    category: 'Hoodies',
    price: '$60.00',
    image:
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 6,
    title: 'Utility Cargo Shorts',
    category: 'Pantalones',
    price: '$50.00',
    image:
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&w=800&q=80',
  },
]
