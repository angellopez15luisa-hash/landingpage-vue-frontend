import type {
  catalogItemSchema,
  catalogItemsDataResponseSchema,
  catalogItemsResponseSchema
} from '@/schemas/catalog-item.schema'
import z from 'zod'


export type CatalogItem = z.input<typeof catalogItemSchema>

export type CatalogItemsResponse = z.infer<typeof catalogItemsResponseSchema>

export type CatalogItemsDataResponse = z.infer<typeof catalogItemsDataResponseSchema>
