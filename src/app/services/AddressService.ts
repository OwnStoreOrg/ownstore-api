import { injectable } from 'inversify'
import BaseService from './BaseService'
import { IAddressService, IUserService } from './interface'
import { IUserAddressInfo, IUserAddressInfoUpdateParams, IUserAddressInfoUpdate } from '../contract/address'
import { prepareUserAddressInfo } from '../transformers/address'
import { IFindParams } from '../contract/common'
import { CacheBuild, CacheBulkBuild, CachePurge, CacheBulkPurge } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'

@injectable()
export default class AddressService extends BaseService implements IAddressService {
  @CacheBulkBuild('AS', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'ADIS')
  private async _prepareUserAddressState(addressIds: number[]): Promise<Record<number, IUserAddressInfo>> {
    const result: Record<number, IUserAddressInfo> = {}

    const addressMap = await this.getUserAddressRepository().getBulk(addressIds)

    Object.entries(addressMap).forEach(([addressId, address]) => {
      result[addressId] = prepareUserAddressInfo(address)
    })

    return result
  }

  @CacheBuild('AS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.DEFAULT, 'ADIL')
  public async getUserAddressInfos(userId: number, findParams: IFindParams): Promise<IUserAddressInfo[]> {
    const addressIds = await this.getUserAddressRepository().getBulkIdsByUserId(userId, findParams)
    const addresses = await this._prepareUserAddressState(addressIds)
    return Object.values(addresses)
  }

  @CacheBulkPurge('US', [[0], [1]], 'USIS')
  private async _clearUserStateCache(isDetail: boolean, userIds: number[]): Promise<void> {}

  @CachePurge('AS', [[0]], 'ADIL', true)
  public async addUserAddress(userId: number, params: IUserAddressInfoUpdateParams): Promise<IUserAddressInfoUpdate> {
    const address = await this.getUserAddressRepository().addUserAddress({
      userId: userId,
      addressId: null,
      name: params.name,
      phoneNumber: params.phoneNumber,
      addressLine: params.addressLine,
      area: params.area,
      areaCode: params.areaCode,
      city: params.city,
      country: params.country,
      isPrimary: params.isPrimary,
      isActive: true,
      addressType: params.addressType,
    })

    await this._clearUserStateCache(true, [userId])

    return {
      success: true,
      userAddress: prepareUserAddressInfo(address),
    }
  }

  @CachePurge('AS', [[1]], 'ADIS', true)
  public async updateUserAddress(
    userId: number,
    addressId: number,
    params: IUserAddressInfoUpdateParams
  ): Promise<IUserAddressInfoUpdate> {
    await this.getUserAddressRepository().updateUserAddress({
      ...params,
      addressId: addressId,
      userId: userId,
    })
    await this._clearUserStateCache(true, [userId])

    return {
      success: true,
      userAddress: null,
    }
  }
}
