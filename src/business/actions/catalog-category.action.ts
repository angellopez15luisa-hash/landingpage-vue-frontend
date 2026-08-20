import { CatalogCategoryService } from '../services/catalog-category.service'

export class CatalogCategoryAction {
  static getAll = () => CatalogCategoryService.getAll()
}
