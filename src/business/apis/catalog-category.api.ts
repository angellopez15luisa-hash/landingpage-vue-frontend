import api from '@/lib/axios'
import type { CatalogCategoriesDataResponse } from '@/types/catalog-category.type'

export class CatalogCategoryApi {
  static getAll = () => api.get<CatalogCategoriesDataResponse>(`/catalog-categories/public`)
}
