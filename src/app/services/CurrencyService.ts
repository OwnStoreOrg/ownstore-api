import { SERVICE_CACHE_TTL } from '../constants'
import { IFindParams } from '../contract/common'
import {
  ICurrencyInfo,
  ICurrencyInfoDelete,
  ICurrencyInfoUpdate,
  ICurrencyInfoUpdateParams,
} from '../contract/currency'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import AppError from '../errors/AppError'
import { EntityNotFoundError } from '../errors/EntityError'
import { prepareCurrencyInfo } from '../transformers/currency'
import BaseService from './BaseService'
import { ICurrencyService } from './interface'

export default class CurrencyService extends BaseService implements ICurrencyService {
  @CacheBulkBuild('CR', [[0]], SERVICE_CACHE_TTL.LONG, 'CRIS')
  private async _prepareCurrencyState(addressIds: number[]): Promise<Record<number, ICurrencyInfo>> {
    const result: Record<number, ICurrencyInfo> = {}

    const currencyMap = await this.getCurrencyRepository().getBulk(addressIds)

    Object.entries(currencyMap).forEach(([currencyId, currency]) => {
      result[currencyId] = prepareCurrencyInfo(currency)
    })

    return result
  }

  @CacheBuild(
    'CR',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.LONG,
    'CRIL'
  )
  public async getAllCurrencyInfos(findParams: IFindParams): Promise<ICurrencyInfo[]> {
    const addressIds = await this.getCurrencyRepository().getBulkIds(findParams)
    const currencyInfos = await this._prepareCurrencyState(addressIds)
    return Object.values(currencyInfos)
  }

  public async getCurrencyInfo(currencyId: number): Promise<ICurrencyInfo> {
    const currencies = await this._prepareCurrencyState([currencyId])
    const currencyInfo = currencies[currencyId]

    if (!currencyInfo) {
      throw new EntityNotFoundError('currency', currencyId)
    }

    return currencyInfo
  }

  public async updateCurrencyInfo(
    currencyId: number | null,
    params: ICurrencyInfoUpdateParams
  ): Promise<ICurrencyInfoUpdate> {
    const result: ICurrencyInfoUpdate = {
      success: false,
    }

    if (currencyId) {
      await this.getCurrencyRepository().updateCurrency({
        currencyId: currencyId,
        ...params,
      })
      result.success = true
    } else {
      const currencies = await this.getAllCurrencyInfos({})

      if (currencies.length === 1) {
        throw new AppError(403, 'Currency already exists', 'CURRENCY_EXISTS')
      }

      await this.getCurrencyRepository().addCurrency({
        currencyId: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteCurrencyInfo(currencyId: number): Promise<ICurrencyInfoDelete> {
    const result: ICurrencyInfoDelete = {
      success: false,
    }

    await this.getCurrencyRepository().deleteCurrency(currencyId)
    result.success = true

    return result
  }
}
