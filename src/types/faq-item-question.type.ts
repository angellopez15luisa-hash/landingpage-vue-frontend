import type {
  faqItemQuestionSchema,
  faqItemQuestionsDataResponseSchema,
  faqItemQuestionsResponseSchema,
} from '@/schemas/faq-item-question.schema'
import type { z } from 'zod'
import {
  faqItemQuestionResponseSchema,
  faqItemQuestionDataResponseSchema,
} from '../schemas/faq-item-question.schema'

export type FaqItemQuestion = z.infer<typeof faqItemQuestionSchema>

export type FaqItemQuestionResponse = z.infer<typeof faqItemQuestionResponseSchema>

export type FaqItemQuestionsResponse = z.infer<typeof faqItemQuestionsResponseSchema>

export type FaqItemQuestionDataResponse = z.infer<typeof faqItemQuestionDataResponseSchema>

export type FaqItemQuestionsDataResponse = z.infer<typeof faqItemQuestionsDataResponseSchema>
