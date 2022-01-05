import appConfig from '../../appConfig'
import { ICartDetail, ICartItem, IPriceAndDeliveryChargeMapping } from '../contract/cart'
import UserCartItemModel from '../models/UserCartItemModel'
import { prepareProductInfo } from './product'

export const prepareCartItem = (cartItem: UserCartItemModel): ICartItem => {
  return {
    id: cartItem.id,
    quantity: cartItem.quantity,
    createdDateTime: new Date(cartItem.createdAt),
    updatedDateTime: new Date(cartItem.updatedAt),
    product: prepareProductInfo({
      individualProduct: cartItem.individualProduct,
      comboProduct: cartItem.comboProduct,
    }),
  }
}

export const prepareCartDetail = (cartItems: UserCartItemModel[]): ICartDetail => {
  return {
    cartItems: cartItems.map(prepareCartItem).sort((a, b) => b.createdDateTime.getTime() - a.createdDateTime.getTime()),
    priceAndDeliveryChargeMapping: appConfig.payment.deliveryPriceMapping,
    extraCharges: {
      percent: appConfig.payment.extraCharges.percent,
      flat: appConfig.payment.extraCharges.flat,
      decimalPrecision: appConfig.payment.extraCharges.decimalPrecision,
    },
    tax: {
      percent: appConfig.payment.tax.percent,
      flat: appConfig.payment.tax.flat,
      decimalPrecision: appConfig.payment.extraCharges.decimalPrecision,
    },
  }
}
