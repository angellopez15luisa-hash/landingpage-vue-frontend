import type { FaqItemQuestionsResponse } from '@/types/faq-item-question.type'
import { isAxiosError } from 'axios'
import { FaqItemQuestionApi } from '../apis/faq-item-question.api'
import { faqItemQuestionsDataResponseSchema } from '@/schemas/faq-item-question.schema'

export class FaqItemQuestionService {
  static getAll = async (): Promise<FaqItemQuestionsResponse> => {
    try {
      const { data } = await FaqItemQuestionApi.getAll()
      const response = faqItemQuestionsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.faqItemQuestions
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
