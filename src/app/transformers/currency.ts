import Currency from '../models/CurrencyModel'
import { ICurrencyInfo } from '../contract/currency'

export const prepareCurrencyInfo = (currency: Currency): ICurrencyInfo => {
  return {
    id: currency.id,
    name: currency.name,
    isoCode: currency.isoCode,
    symbol: currency.symbol,
  }
}
