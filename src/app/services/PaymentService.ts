import { inject, injectable } from 'inversify'
import appConfig from '../../appConfig'
import { IPaymentProvider } from '../../support/payment/interface'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'
import { IFindParams } from '../contract/common'
import { ICurrencyInfo } from '../contract/currency'
import { IOrderAddParams, IOrderDetail, IOrderInfo } from '../contract/order'
import { IInitiatePayment, ISuccessfulPayment, ISuccessfulPaymentParams } from '../contract/payment'
import AppError from '../errors/AppError'
import { EntityNotFoundError } from '../errors/EntityError'
import { IOrderAddCommand } from '../repositories/commands/payment'
import { prepareOrderDetail, prepareOrderInfo } from '../transformers/order'
import {
  getCartTotal,
  getCartCurrency,
  getCartRetailTotal,
  getCartSaleTotal,
  getCartDiscountTotal,
  getCartDeliveryTotal,
  getCartExtraChargesTotal,
  getCartTaxTotal,
} from '../utils/payment'
import BaseService from './BaseService'
import { ICartService, IOrderService, IPaymentService } from './interface'

@injectable()
export default class PaymentService extends BaseService implements IPaymentService {
  @lazyInject(AppTypes.PaymentProvider)
  private paymentProvider!: IPaymentProvider

  @lazyInject(AppTypes.CartService)
  private cartService!: ICartService

  @lazyInject(AppTypes.OrderService)
  private orderService!: IOrderService

  public async initiatePayment(userId: number): Promise<IInitiatePayment> {
    const cartDetail = await this.cartService.getUserCartDetail(userId)

    if (cartDetail.cartItems.length === 0) {
      throw new AppError(406, 'Cart is empty', 'EMPTY_CART', cartDetail)
    }

    const totalAmount = getCartTotal(cartDetail)
    const currency = getCartCurrency(cartDetail) as ICurrencyInfo

    if (totalAmount < 1) {
      throw new AppError(406, 'Cart amount is 0', 'ZERO_CART_AMOUNT', totalAmount)
    }

    const paymentIntent = await this.paymentProvider.createPaymentIntent({
      userId: userId,
      totalAmount: totalAmount * appConfig.payment.smallestCurrencyUnit,
      currency,
    })

    return {
      clientSecret: paymentIntent.client_secret,
    }
  }

  public async successfulPayment(userId: number, params: ISuccessfulPaymentParams): Promise<ISuccessfulPayment> {
    const cartDetail = await this.cartService.getUserCartDetail(userId)

    if (cartDetail.cartItems.length === 0) {
      throw new AppError(406, 'Cart is empty', 'EMPTY_CART', cartDetail)
    }

    const response: ISuccessfulPayment = {
      success: false,
      orderId: null,
    }

    const currency = getCartCurrency(cartDetail) as ICurrencyInfo

    const retailAmount = getCartRetailTotal(cartDetail)
    const saleAmount = getCartSaleTotal(cartDetail)
    const discountAmount = getCartDiscountTotal(cartDetail)
    const deliveryAmount = getCartDeliveryTotal(cartDetail)
    const totalAmount = getCartTotal(cartDetail)
    const extraChargesAmount = getCartExtraChargesTotal(cartDetail)
    const taxAmount = getCartTaxTotal(cartDetail)

    const newOrderParams: IOrderAddParams = {
      addressId: params.addressId,
      currencyId: currency.id,
      retailAmount: retailAmount,
      saleAmount: saleAmount,
      discountAmount: discountAmount,
      deliveryAmount: deliveryAmount,
      totalAmount: totalAmount,
      extraChargesAmount: extraChargesAmount,
      taxAmount: taxAmount,
      cart: cartDetail,
      thirdPartyPaymentId: params.thirdPartyPaymentId,
      paymentMethod: params.paymentMethod,
    }

    const newOrderId = await this.orderService.addUserOrderInfo(userId, newOrderParams)

    if (!newOrderId) {
      throw new AppError(400, 'Failed to add a new order', 'FAILED_TO_ADD_NEW_ORDER', {
        userId: userId,
        params: params,
        newOrderParams: newOrderParams,
      })
    }

    try {
      await this.paymentProvider.updatePaymentIntent(params.thirdPartyPaymentId, {
        orderId: newOrderId,
      })
      await this.orderService.addOrderStatusHistory(newOrderId, appConfig.order.status.RECEIVED)
      await this.cartService.deleteUserCartItem(userId)
      response.success = true
      response.orderId = newOrderId
    } catch (e) {
      response.success = false
    }

    return response
  }
}
