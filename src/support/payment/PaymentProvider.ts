import {
  ICreatePaymentIntentParams,
  IPaymentProvider,
  IUpdatePaymentIntentParams,
  IUpdateRefundIntentParams,
} from './interface'
import Stripe from 'stripe'
import appConfig from '../../appConfig'

export default class PaymentProvider implements IPaymentProvider {
  private client: Stripe

  public constructor() {
    this.client = new Stripe(appConfig.integrations.stripePayment.secretKey, {
      apiVersion: '2020-08-27',
    })
  }

  public async createPaymentIntent(params: ICreatePaymentIntentParams): Promise<Stripe.Response<Stripe.PaymentIntent>> {
    const paymentIntent = await this.client.paymentIntents.create({
      amount: params.totalAmount,
      currency: params.currency.isoCode,
      metadata: {
        userId: params.userId,
        currencyId: params.currency.id,
      },
    })
    return paymentIntent
  }

  public async updatePaymentIntent(paymentId: string, params: IUpdatePaymentIntentParams): Promise<void> {
    await this.client.paymentIntents.update(paymentId, {
      metadata: {
        orderId: params.orderId,
      },
    })
  }

  public async createRefundIntent(thirdPartyPaymentId: string, params: IUpdateRefundIntentParams): Promise<void> {
    await this.client.refunds.create({
      payment_intent: thirdPartyPaymentId,
      amount: params.amount,
    })
  }
}
