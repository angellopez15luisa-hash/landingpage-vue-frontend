import { HeroSectionService } from '../services/hero-section.service'

export class HeroSectionAction {
  static getAll = () => HeroSectionService.getAll()
}
