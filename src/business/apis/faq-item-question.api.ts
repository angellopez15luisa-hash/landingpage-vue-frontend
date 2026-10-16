import api from '@/lib/axios'
import type { FaqItemQuestionsDataResponse } from '@/types/faq-item-question.type'

export class FaqItemQuestionApi {
  static getAll = () => api.get<FaqItemQuestionsDataResponse>(`/faq-item-questions/public`)
}
