import { CatalogItemService } from '../services/catalog-item.service'

export class CatalogItemAction {
  static getAll = () => CatalogItemService.getAll()
}
