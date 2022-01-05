import { inject, injectable } from 'inversify'
import appConfig from '../../appConfig'
import { IPaymentProvider } from '../../support/payment/interface'
import AppTypes from '../AppTypes'
import { SERVICE_CACHE_TTL } from '../constants'
import { lazyInject } from '../container'
import { IFindParams } from '../contract/common'
import {
  IRefundOrderDetail,
  IOrderAddParams,
  IOrderDetail,
  IOrderInfo,
  IUpdateOrderInfoParams,
  IUpdateOrderInfo,
  IRefundOrderDetailParams,
  IOrderStatusInfo,
  IOrderStatusInfoUpdateParams,
  IOrderStatusInfoUpdate,
  IOrderStatusInfoDelete,
} from '../contract/order'
import { CacheBuild, CacheBulkBuild, CacheBulkPurge, CachePurge } from '../decorators/cache'
import AppError from '../errors/AppError'
import { EntityNotFoundError } from '../errors/EntityError'
import { prepareOrderDetail, prepareOrderInfo, prepareOrderStatusInfo } from '../transformers/order'
import { calculatePercentage } from '../utils/common'
import BaseService from './BaseService'
import { IOrderService } from './interface'

@injectable()
export default class PaymentService extends BaseService implements IOrderService {
  @lazyInject(AppTypes.PaymentProvider)
  private paymentProvider!: IPaymentProvider

  @CacheBulkBuild('OR', [[0], [1]], SERVICE_CACHE_TTL.DEFAULT, 'ORDS')
  private async _prepareOrderState(
    isDetail: boolean,
    orderIds: number[]
  ): Promise<Record<number, IOrderInfo | IOrderDetail>> {
    const orders = await this.getOrderRepository().getBulkByIds(orderIds, isDetail)
    const ordersHistory = await this.getOrderStatusHistoryRepository().getBulkByOrderIds(orderIds)

    const result: Record<number, IOrderInfo | IOrderDetail> = {}

    Object.entries(orders).forEach(([orderId, order]) => {
      let orderInfo: any = null

      if (isDetail) {
        orderInfo = prepareOrderDetail(order, ordersHistory[order.id])
      } else {
        orderInfo = prepareOrderInfo(order, ordersHistory[order.id])
      }

      result[orderId] = orderInfo
    })

    return result
  }

  @CacheBulkPurge('OR', [[0], [1]], 'ORDS')
  private async _clearOrderStateCache(isDetail: boolean, orderIds: number[]): Promise<void> {}

  @CacheBuild('OR', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.SHORT, 'ORIL')
  public async getUserOrderInfos(userId: number, findParams: IFindParams): Promise<IOrderInfo[]> {
    const userOrderIds = await this.getOrderRepository().getBulkIdsByUserId(userId, findParams)

    if (!userOrderIds.length) {
      return []
    }

    const userOrders = await this._prepareOrderState(false, userOrderIds)
    return Object.values(userOrders).sort((a, b) => b.id - a.id)
  }

  public async getOrderInfo(orderId: number): Promise<IOrderInfo> {
    const userOrders = await this._prepareOrderState(false, [orderId])
    const orderInfo = userOrders[orderId]

    if (!orderInfo) {
      throw new EntityNotFoundError('Order Info', orderId)
    }

    return orderInfo
  }

  public async getUserOrderInfo(userId: number, orderId: number): Promise<IOrderInfo> {
    const orderInfo = await this.getOrderInfo(orderId)

    if (userId !== orderInfo.userId) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    return orderInfo
  }

  public async getOrderDetail(orderId: number): Promise<IOrderDetail> {
    const userOrders = await this._prepareOrderState(true, [orderId])
    const orderDetail = userOrders[orderId] as IOrderDetail

    if (!orderDetail) {
      throw new EntityNotFoundError('Order Detail', orderId)
    }

    return orderDetail
  }

  public async getUserOrderDetail(userId: number, orderId: number): Promise<IOrderDetail> {
    const orderDetail = await this.getOrderDetail(orderId)

    if (userId !== orderDetail.userId) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND')
    }

    return orderDetail
  }

  @CachePurge('OR', [[0]], 'ORIL', true)
  public async addUserOrderInfo(userId: number, params: IOrderAddParams): Promise<number> {
    const newOrder = await this.getOrderRepository().addOrder({
      userId: userId,
      ...params,
    })
    return newOrder.id
  }

  public async updateOrderInfo(orderId: number, params: IUpdateOrderInfoParams): Promise<IUpdateOrderInfo> {
    const result: IUpdateOrderInfo = {
      success: false,
    }

    let cancellationId: number | any = null

    if (params.cancellationReason) {
      cancellationId = await this.getOrderCancellationRepository().addOrderCancellation({
        orderId: orderId,
        reason: params.cancellationReason,
      })
    }

    await this.getOrderRepository().updateOrder({
      orderId: orderId,
      statusText: params.statusText,
      orderCancellationId: cancellationId,
    })

    if (params.orderStatusId) {
      await this.addOrderStatusHistory(orderId, params.orderStatusId)
    }

    await this._clearOrderStateCache(true, [orderId])
    await this._clearOrderStateCache(false, [orderId])

    result.success = true

    return result
  }

  @CacheBuild(
    'OR',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.SHORT
  )
  public async getRecentOrders(findParams: IFindParams): Promise<IOrderInfo[]> {
    const latestOrderIds = await this.getOrderRepository().getLatestBulkIds(findParams)

    if (!latestOrderIds.length) {
      return []
    }

    const orders = await this._prepareOrderState(false, latestOrderIds)
    return Object.values(orders).sort((a, b) => b.id - a.id)
  }

  public async refundUserOrderDetail(
    userId: number,
    orderId: number,
    params: IRefundOrderDetailParams
  ): Promise<IRefundOrderDetail> {
    const result: IRefundOrderDetail = {
      success: false,
      orderDetail: null,
    }

    const orders = await this.getOrderRepository().getBulkByIds([orderId], true)
    const order = orders[orderId]

    if (!order) {
      throw new AppError(404, 'Order not found', 'ORDER_NOT_FOUND', {
        orderId,
      })
    }

    if (order.orderCancellation) {
      throw new AppError(403, 'Order already cancelled', 'ORDER_CANCELLED', {
        orderId,
      })
    }

    const baseAmount = order.totalAmount * appConfig.payment.smallestCurrencyUnit
    await this.paymentProvider.createRefundIntent(order.thirdPartyPaymentId, {
      userId: userId,
      orderId: orderId,
      amount: calculatePercentage(appConfig.payment.refundAmountPercent, baseAmount),
    })

    await this.updateOrderInfo(orderId, {
      statusText: 'Order has been cancelled. Money will be refunded to your bank account within 7 working days',
      orderStatusId: appConfig.order.status.CANCELLED,
      cancellationReason: params.reason,
    })

    const orderDetail = await this.getUserOrderDetail(userId, orderId)

    await this._clearOrderStateCache(true, [orderId])
    await this._clearOrderStateCache(false, [orderId])

    result.success = true
    result.orderDetail = orderDetail

    return result
  }

  public async addOrderStatusHistory(orderId: number, orderStatusId: number): Promise<void> {
    await this.getOrderStatusHistoryRepository().addOrderStatusHistory({
      orderId: orderId,
      orderStatusId: orderStatusId,
    })
  }

  @CacheBulkBuild('OS', [[0]], SERVICE_CACHE_TTL.LONG)
  private async _prepareOrderStatusState(brandIds: number[]): Promise<Record<number, IOrderStatusInfo>> {
    const result: Record<number, IOrderStatusInfo> = {}

    const statusList = await this.getOrderStatusTypeRepository().getBulk(brandIds)

    Object.entries(statusList).forEach(([statusId, status]) => {
      result[statusId] = prepareOrderStatusInfo(status)
    })

    return result
  }

  @CacheBuild(
    'OS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.LONG
  )
  public async getAllOrderStatusInfos(findParams: IFindParams): Promise<IOrderStatusInfo[]> {
    const statusIds = await this.getOrderStatusTypeRepository().getBulkIds(findParams)
    const statusInfos = await this._prepareOrderStatusState(statusIds)
    return Object.values(statusInfos)
  }

  public async getOrderStatusInfo(statusId: number): Promise<IOrderStatusInfo> {
    const statusList = await this._prepareOrderStatusState([statusId])
    const statusInfo = statusList[statusId]

    if (!statusInfo) {
      throw new EntityNotFoundError('Order Status', statusId)
    }

    return statusInfo
  }

  public async updateOrderStatusInfo(
    statusId: number | null,
    params: IOrderStatusInfoUpdateParams
  ): Promise<IOrderStatusInfoUpdate> {
    const result: IOrderStatusInfoUpdate = {
      success: false,
    }

    await this.getOrderStatusTypeRepository().saveOrderStatus({
      id: statusId,
      ...params,
    })

    result.success = true

    return result
  }

  public async deleteOrderStatusInfo(statusId: number): Promise<IOrderStatusInfoDelete> {
    const result: IOrderStatusInfoDelete = {
      success: false,
    }

    await this.getOrderStatusTypeRepository().deleteOrderStatus(statusId)
    result.success = true

    return result
  }
}
