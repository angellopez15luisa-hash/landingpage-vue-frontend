import type {
  catalogCategoriesDataResponseSchema,
  catalogCategoriesResponseSchema,
  catalogCategorySchema,
} from '@/schemas/catalog-category.schema'
import z from 'zod'

export type CatalogCategory = z.input<typeof catalogCategorySchema>

export type CatalogCategoriesResponse = z.infer<typeof catalogCategoriesResponseSchema>

export type CatalogCategoriesDataResponse = z.infer<typeof catalogCategoriesDataResponseSchema>
