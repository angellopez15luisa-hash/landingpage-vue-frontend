import { isAxiosError } from 'axios'

import { heroSectionsDataResponseSchema } from '@/schemas/hero-section.schema'
import { HeroSectionApi } from '../apis/hero-section.api'
import type { HeroSectionsResponse } from '@/types/hero-section.type'

export class HeroSectionService {
  static getAll = async (): Promise<HeroSectionsResponse> => {
    try {
      const { data } = await HeroSectionApi.getAll()
      const response = heroSectionsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.heroSections
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
