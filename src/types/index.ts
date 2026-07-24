export type Category = 'all' | 'casacas' | 'hoodies' | 'pantalones'

export interface Product {
  id: string
  name: string
  category: 'casacas' | 'hoodies' | 'pantalones'
  image: string
  sizes: string[]
  price: number
}

export interface Review {
  id: string
  author: string
  text: string
  stars: number
}

export interface FaqItem {
  question: string
  answer: string
}

export interface SlideItem {
  image: string
  tag: string
  title: string
  highlightText: string
  description: string
}

export interface OrderStep {
  number: string;
  title: string;
  description: string;
}

export interface CatalogItem {
  id: number;
  title: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
}

export interface ReviewOpinion {
  id: number
  name: string
  rating: number
  text: string
}

export interface FaqItemQuestion {
  id: number
  question: string
  answer: string
}


