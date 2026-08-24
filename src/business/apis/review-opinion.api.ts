import api from '@/lib/axios'
import type { ReviewOpinionsDataResponse } from '@/types/review-opinion.type'

export class ReviewOpinionApi {
  static getAll = () => api.get<ReviewOpinionsDataResponse>(`/review-opinions/public`)
}
