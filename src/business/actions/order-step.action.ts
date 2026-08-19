import { OrderStepService } from '../services/order-step.service'

export class OrderStepAction {
  static getAll = () => OrderStepService.getAll()
}
