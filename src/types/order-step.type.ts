import type {
  orderStepsDataResponseSchema,
  orderStepsResponseSchema
} from '@/schemas/order-step.schema'
import z from 'zod'



export type OrderStepsResponse = z.infer<typeof orderStepsResponseSchema>

export type OrderStepsDataResponse = z.infer<typeof orderStepsDataResponseSchema>
