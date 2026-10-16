import { FaqItemQuestionService } from '../services/faq-item-question.service'

export class FaqItemQuestionAction {
  static getAll = () => FaqItemQuestionService.getAll()
}
