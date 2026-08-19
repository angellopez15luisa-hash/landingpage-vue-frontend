import { isAxiosError } from 'axios'

import { itemSectionsDataResponseSchema } from '@/schemas/item-section.schema'
import { ItemSectionApi } from '../apis/item-section.api'
import type { itemSectionsResponse } from '@/types/item-section.type'

export class ItemSectionService {
  static async getAll(): Promise<itemSectionsResponse> {
    try {
      const { data } = await ItemSectionApi.getAll()
      const response = itemSectionsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.itemSections
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
