import type { itemSectionsDataResponseSchema, itemSectionsResponseSchema } from '@/schemas/item-section.schema'
import z from 'zod'

export type ItemSectionsDataResponse = z.infer<typeof itemSectionsDataResponseSchema>

export type itemSectionsResponse =z.infer<typeof itemSectionsResponseSchema>
