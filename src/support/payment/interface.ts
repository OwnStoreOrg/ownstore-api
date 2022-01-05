import Stripe from 'stripe'
import { ICurrencyInfo } from '../../app/contract/currency'

export interface ICreatePaymentIntentParams {
  userId: number
  totalAmount: number
  currency: ICurrencyInfo
}

export interface IUpdatePaymentIntentParams {
  orderId: number
}

export interface IUpdateRefundIntentParams {
  userId: number
  orderId: number
  amount: number
}

export interface IPaymentProvider {
  createPaymentIntent(params: ICreatePaymentIntentParams): Promise<Stripe.Response<Stripe.PaymentIntent>>
  updatePaymentIntent(thirdPartyPaymentId: string, params: IUpdatePaymentIntentParams): Promise<void>
  createRefundIntent(thirdPartyPaymentId: string, params: IUpdateRefundIntentParams): Promise<void>
}
