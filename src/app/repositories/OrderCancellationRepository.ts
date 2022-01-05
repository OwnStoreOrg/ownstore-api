import { EntityRepository, FindManyOptions, Repository } from 'typeorm'
import OrderCancellation from '../models/OrderCancellationModel'
import { IOrderCancellationAddCommand } from './commands/payment'

@EntityRepository(OrderCancellation)
export default class OrderCancellationRepository extends Repository<OrderCancellation> {
  public async addOrderCancellation(command: IOrderCancellationAddCommand): Promise<OrderCancellation> {
    const result = await this.save({
      order: command.orderId as any,
      reason: command.reason,
      createdAt: new Date(),
    })

    return result
  }
}
