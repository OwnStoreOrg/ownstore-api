import { ICartDetail, ICartItem } from '../contract/cart'
import {
  IOrderCancellationInfo,
  IOrderCartItemMeta,
  IOrderDetail,
  IOrderInfo,
  IOrderStatusHistoryInfo,
  IOrderStatusInfo,
} from '../contract/order'
import { IComboProductInfo, IIndividualProductInfo } from '../contract/product'
import Order from '../models/OrderModel'
import { prepareCurrencyInfo } from './currency'
import { prepareUserInfo } from './user'
import { prepareUserAddressInfo } from './address'
import OrderCancellation from '../models/OrderCancellationModel'
import OrderStatusTypeModel from '../models/OrderStatusTypeModel'
import OrderStatusHistory from '../models/OrderStatusHistoryModel'
import appConfig from '../../appConfig'

export const prepareOrderCancellationInfo = (orderCancellation: OrderCancellation): IOrderCancellationInfo => {
  return {
    id: orderCancellation.id,
    reason: orderCancellation.reason,
    createdDateTime: new Date(orderCancellation.createdAt),
  }
}

export const prepareOrderInfo = (order: Order, orderStatusHistory: OrderStatusHistory[]): IOrderInfo => {
  const cart: ICartDetail = JSON.parse(order.cartJSON)

  const cartItemsMeta: IOrderCartItemMeta[] = cart.cartItems.map(cartItem => {
    const cartProduct = cartItem.product as IIndividualProductInfo | IComboProductInfo
    return {
      id: cartItem.id,
      quantity: cartItem.quantity,
      productName: cartProduct.name,
    }
  })

  return {
    id: order.id,
    totalAmount: order.totalAmount,
    currency: prepareCurrencyInfo(order.currency),
    userId: order.user.id,
    cartItemsMeta: cartItemsMeta,
    orderStatusHistory: orderStatusHistory.map(prepareOrderStatusHistoryInfo),
    createdDateTime: new Date(order.createdAt),
    updatedDateTime: new Date(order.updatedAt),
  }
}

export const prepareOrderDetail = (order: Order, orderStatusHistory: OrderStatusHistory[]): IOrderDetail => {
  const cart: ICartDetail = JSON.parse(order.cartJSON)

  return {
    ...prepareOrderInfo(order, orderStatusHistory),
    retailAmount: order.retailAmount,
    saleAmount: order.saleAmount,
    discountAmount: order.discountAmount,
    deliveryAmount: order.deliveryAmount,
    extraChargesAmount: order.extraChargesAmount,
    taxAmount: order.taxAmount,
    cart: cart,
    user: prepareUserInfo(order.user),
    address: prepareUserAddressInfo(order.address),
    statusText: order.statusText,
    orderCancellation: order.orderCancellation ? prepareOrderCancellationInfo(order.orderCancellation) : null,
    paymentMethod: order.paymentMethod,
    thirdPartyPaymentId: order.thirdPartyPaymentId,
    cancellationReasons: appConfig.order.cancellationReasons,
  }
}

export const prepareOrderStatusHistoryInfo = (orderStatusHistory: OrderStatusHistory): IOrderStatusHistoryInfo => {
  return {
    id: orderStatusHistory.id,
    status: prepareOrderStatusInfo(orderStatusHistory.orderStatus),
    createdDateTime: new Date(orderStatusHistory.createdAt),
  }
}

export const prepareOrderStatusInfo = (orderStatus: OrderStatusTypeModel): IOrderStatusInfo => {
  return {
    id: orderStatus.id,
    name: orderStatus.name,
    createdDateTime: new Date(orderStatus.createdAt),
  }
}
