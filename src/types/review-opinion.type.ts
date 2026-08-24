import type { z } from 'zod'
import {
  reviewOpinionDataResponseSchema,
  reviewOpinionResponseSchema,
  reviewOpinionSchema,
  reviewOpinionsDataResponseSchema,
  reviewOpinionsResponseSchema,
} from '../schemas/review-opinion.schema'

export type ReviewOpinion = z.infer<typeof reviewOpinionSchema>

export type ReviewOpinionResponse = z.infer<typeof reviewOpinionResponseSchema>

export type ReviewOpinionsResponse = z.infer<typeof reviewOpinionsResponseSchema>

export type ReviewOpinionDataResponse = z.infer<typeof reviewOpinionDataResponseSchema>

export type ReviewOpinionsDataResponse = z.infer<typeof reviewOpinionsDataResponseSchema>
