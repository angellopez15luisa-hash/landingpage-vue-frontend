import type { OrderStepsResponse } from '@/types/order-step.type'
import { isAxiosError } from 'axios'
import { orderStepsDataResponseSchema } from '@/schemas/order-step.schema'
import { OrderStepApi } from '../apis/order-step.api'

export class OrderStepService {
  static getAll = async (): Promise<OrderStepsResponse> => {
    try {
      const { data } = await OrderStepApi.getAll()
      const response = orderStepsDataResponseSchema.safeParse(data)
      if (!response.success)
        throw new Error('La respuesta del servidor no tiene el formato esperado')
      return response.data.orderSteps
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message)
      }
      throw error
    }
  }
}
