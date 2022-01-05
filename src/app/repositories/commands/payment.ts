import { ICartDetail, ICartItem } from '../../contract/cart'
import { PaymentMethodType } from '../../contract/constants'

export interface IOrderAddCommand {
  userId: number
  addressId: number
  currencyId: number
  retailAmount: number
  saleAmount: number
  discountAmount: number
  deliveryAmount: number
  totalAmount: number
  extraChargesAmount: number | null
  taxAmount: number | null
  cart: ICartDetail
  thirdPartyPaymentId: string
  paymentMethod: PaymentMethodType
}

export interface IOrderStatusHistoryAddCommand {
  orderId: number
  orderStatusId: number
}

export interface IOrderUpdateCommand {
  orderId: number
  statusText: string | null
  orderCancellationId: number | null
}

export interface IOrderCancellationAddCommand {
  orderId: number
  reason: string
}

export interface IOrderStatusInfoUpdateCommand {
  id: number | null
  name: string
}
