import type {
  heroSectionsDataResponseSchema,
  heroSectionsResponseSchema
} from '@/schemas/hero-section.schema'
import z from 'zod'

 
export type HeroSectionsResponse = z.infer<typeof heroSectionsResponseSchema>

export type HeroSectionsDataResponse = z.infer<typeof heroSectionsDataResponseSchema>
