import type {
  catalogCategoriesDataResponseSchema,
  catalogCategoriesResponseSchema
} from '@/schemas/catalog-category.schema'
import z from 'zod'





export type CatalogCategoriesResponse = z.infer<typeof catalogCategoriesResponseSchema>

export type CatalogCategoriesDataResponse = z.infer<typeof catalogCategoriesDataResponseSchema>
