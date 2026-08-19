import api from '@/lib/axios'
import type { HeroSectionsDataResponse } from '@/types/hero-section.type'

export class HeroSectionApi {
  static getAll = () => api.get<HeroSectionsDataResponse>(`/hero-sections/public`)
}
