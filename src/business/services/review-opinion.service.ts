import type { ReviewOpinionsResponse } from '@/types/review-opinion.type'
import { isAxiosError } from 'axios'
import { ReviewOpinionApi } from '../apis/review-opinion.api'
import { reviewOpinionsDataResponseSchema } from '@/schemas/review-opinion.schema'

export class ReviewOpinionService {
  static getAll = async (): Promise<ReviewOpinionsResponse> => {
    try {
      const { data } = await ReviewOpinionApi.getAll()
      const response = reviewOpinionsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.reviewOpinions
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
