import api from '@/lib/axios'
import type { OrderStepsDataResponse } from '@/types/order-step.type'

export class OrderStepApi {
  static getAll = () => api.get<OrderStepsDataResponse>(`/order-steps/public`)
}
