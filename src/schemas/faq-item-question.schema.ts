import { z } from 'zod'

export const faqItemQuestionSchema = z.object({
  id: z.number().optional(),
  question: z.string(),
  answer: z.string(),
  isActive:z.boolean()
})

export const faqItemQuestionResponseSchema = faqItemQuestionSchema.pick({
  id: true,
  question: true,
  answer: true,
  isActive:true
})

export const faqItemQuestionsResponseSchema = z.array(faqItemQuestionResponseSchema)

export const faqItemQuestionDataResponseSchema = z.object({
  faqItemQuestion: faqItemQuestionResponseSchema,
  success:z.boolean()
})

export const faqItemQuestionsDataResponseSchema = z.object({
  faqItemQuestions: faqItemQuestionsResponseSchema,
  success:z.boolean()
})


