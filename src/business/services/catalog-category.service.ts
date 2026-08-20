import { isAxiosError } from 'axios'
import { CatalogCategoryApi } from '../apis/catalog-category.api'
import type { CatalogCategoriesResponse } from '@/types/catalog-category.type'
import { catalogCategoriesDataResponseSchema } from '@/schemas/catalog-category.schema'

export class CatalogCategoryService {
  static getAll = async (): Promise<CatalogCategoriesResponse> => {
    try {
      const { data } = await CatalogCategoryApi.getAll()
      const response = catalogCategoriesDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.catalogCategories
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
