import api from '@/lib/axios'
import type { ItemSectionsDataResponse } from "@/types/item-section.type"

export class ItemSectionApi {
  static getAll() {
    return api.get<ItemSectionsDataResponse>(`/item-sections/public`)
  }


}
