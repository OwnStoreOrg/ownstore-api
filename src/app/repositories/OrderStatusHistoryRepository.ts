import { EntityRepository, FindManyOptions, In, Repository } from 'typeorm'
import OrderStatusHistory from '../models/OrderStatusHistoryModel'
import { IOrderStatusHistoryAddCommand } from './commands/payment'

@EntityRepository(OrderStatusHistory)
export default class OrderStatusHistoryRepository extends Repository<OrderStatusHistory> {
  public async getBulkByOrderIds(orderIds: number[]): Promise<Record<number, OrderStatusHistory[]>> {
    const result: Record<number, OrderStatusHistory[]> = {}

    const r: FindManyOptions<OrderStatusHistory> = {
      relations: ['orderStatus', 'order'],
      where: {
        order: {
          id: In([...orderIds]),
        },
      },
      order: {
        id: 'DESC',
      },
    }

    const history = await this.find(r)

    history.forEach(row => {
      if (!result[row.order.id]) {
        result[row.order.id] = []
      }
      result[row.order.id].push(row)
    })

    return result
  }

  public async addOrderStatusHistory(command: IOrderStatusHistoryAddCommand): Promise<OrderStatusHistory> {
    const newOrder = await this.save({
      order: command.orderId as any,
      orderStatus: command.orderStatusId as any,
      createdAt: new Date(),
    })

    return newOrder
  }
}
