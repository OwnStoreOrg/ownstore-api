import { EntityRepository, FindManyOptions, In, Repository } from 'typeorm'
import OrderStatusType from '../models/OrderStatusTypeModel'
import { IFindCommand } from './commands/common'
import { IOrderStatusInfoUpdateCommand } from './commands/payment'

@EntityRepository(OrderStatusType)
export default class OrderStatusTypeRepository extends Repository<OrderStatusType> {
  public async getBulk(statusIds: number[]): Promise<Record<number, OrderStatusType>> {
    const result: Record<number, OrderStatusType> = {}

    const _findOptions: FindManyOptions<OrderStatusType> = {
      relations: [],
      where: {
        id: In([...statusIds]),
      },
    }

    const statusList = await this.find(_findOptions)

    statusList.forEach(status => {
      result[status.id] = status
    })

    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
      select: ['id'],
      order: {
        id: 'ASC',
      },
    }

    const statusList = await this.find(_findOptions)
    return statusList.map(status => status.id)
  }

  public async saveOrderStatus(command: IOrderStatusInfoUpdateCommand): Promise<OrderStatusType> {
    const newCurrency = await this.save({
      name: command.name,
      ...(!command.id && { createdAt: new Date() }),
      updatedAt: new Date(),
    })
    return newCurrency
  }

  public async deleteOrderStatus(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
