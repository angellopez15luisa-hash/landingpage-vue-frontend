import { isAxiosError } from 'axios'

import { catalogItemsDataResponseSchema } from '@/schemas/catalog-item.schema'
import { CatalogItemApi } from '../apis/catalog-item.api'
import type { CatalogItemsResponse } from '@/types/catalog-item.type'

export class CatalogItemService {
  static getAll = async (): Promise<CatalogItemsResponse> => {
    try {
      const { data } = await CatalogItemApi.getAll()
      const response = catalogItemsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.catalogItems
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
