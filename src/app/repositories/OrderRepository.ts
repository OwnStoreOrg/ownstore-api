import { EntityRepository, FindManyOptions, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import Order from '../models/OrderModel'
import { IFindCommand } from './commands/common'
import { IOrderAddCommand, IOrderUpdateCommand } from './commands/payment'

@EntityRepository(Order)
export default class OrderRepository extends Repository<Order> {
  public async getBulkByIds(ids: number[], detail: boolean): Promise<Record<number, Order>> {
    const result: Record<number, Order> = {}

    const relations = ['currency', 'user']
    if (detail) {
      ;['address', 'orderCancellation'].forEach(r => relations.push(r))
    }

    const _findOptions: FindManyOptions<Order> = {
      relations: relations,
    }

    const orders = await this.findByIds(ids, _findOptions)

    orders.forEach(order => {
      result[order.id] = order
    })

    return result
  }

  public async getBulkIdsByUserId(userId: number, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<Order> = {
      relations: [],
      where: {
        user: {
          id: userId,
        },
      },
      select: ['id'],
      take: findCommand.limit,
      skip: findCommand.offset,
      order: {
        id: 'DESC',
      },
    }

    const orders = await this.find(_findOptions)

    orders.forEach(order => {
      result.push(order.id)
    })

    return result
  }

  public async getLatestBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<Order> = {
      relations: [],
      select: ['id'],
      take: findCommand.limit,
      skip: findCommand.offset,
      order: {
        id: 'DESC',
      },
    }

    const orders = await this.find(_findOptions)

    orders.forEach(order => {
      result.push(order.id)
    })

    return result
  }

  public async addOrder(command: IOrderAddCommand): Promise<Order> {
    const newOrder = await this.save({
      user: command.userId as any,
      address: command.addressId as any,
      currency: command.currencyId as any,
      retailAmount: command.retailAmount,
      saleAmount: command.saleAmount,
      discountAmount: command.discountAmount,
      deliveryAmount: command.deliveryAmount,
      totalAmount: command.totalAmount,
      extraChargesAmount: command.extraChargesAmount,
      taxAmount: command.taxAmount,
      cartJSON: JSON.stringify(command.cart),
      thirdPartyPaymentId: command.thirdPartyPaymentId,
      paymentMethod: command.paymentMethod,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return newOrder
  }

  public async updateOrder(command: IOrderUpdateCommand): Promise<void> {
    const updateObj: QueryDeepPartialEntity<Order> = {
      updatedAt: new Date(),
      statusText: command.statusText,
      orderCancellation: command.orderCancellationId as any,
    }

    await this.update(
      {
        id: command.orderId,
      },
      updateObj
    )
  }
}
