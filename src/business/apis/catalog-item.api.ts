import api from '@/lib/axios'
import type { CatalogItemsDataResponse } from '@/types/catalog-item.type'

export class CatalogItemApi {
  static getAll = () => api.get<CatalogItemsDataResponse>('/catalog-items/public')
}
