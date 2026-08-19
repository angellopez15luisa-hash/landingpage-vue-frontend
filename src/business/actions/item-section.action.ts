import { ItemSectionService } from '../services/item-section.service'

export class ItemSectionAction {
  static getAll() {
    return ItemSectionService.getAll()
  }
}
