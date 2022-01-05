import { inject, injectable } from 'inversify'
import BaseService from './BaseService'
import { IProductService, IWishlistService } from './interface'
import { IFindParams } from '../contract/common'
import { IUserWishInfo, IUserWishInfoAdd, IUserWishInfoAddParams, IUserWishInfoDelete } from '../contract/userWish'
import { prepareUserWishInfo } from '../transformers/userWish'
import { ProductType } from '../contract/constants'
import { CacheBuild, CachePurge } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import { IComboProductInfo, IIndividualProductInfo } from '../contract/product'
import AppError from '../errors/AppError'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'

@injectable()
export default class WishlistService extends BaseService implements IWishlistService {
  @lazyInject(AppTypes.ProductService)
  private productService!: IProductService

  @CacheBuild('WL', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'WIL')
  public async getUserWishInfos(userId: number): Promise<IUserWishInfo[]> {
    const wishlist = await this.getUserWishRepository().getBulkByUserId(userId, {})
    return wishlist.map(prepareUserWishInfo)
  }

  private async _checkProductSKU(productInfo: IIndividualProductInfo | IComboProductInfo): Promise<void> {
    if (productInfo.sku) {
      if (productInfo.sku.comingSoon) {
        throw new AppError(403, 'Product will be available soon', 'PRODUCT_COMING_SOON')
      } else if (productInfo.sku.availableQuantity < 1) {
        throw new AppError(403, 'Product is not available', 'PRODUCT_UNAVAILABLE')
      }
    }
  }

  @CachePurge('WL', [[0]], 'WIL')
  public async addUserWishInfo(userId: number, params: IUserWishInfoAddParams): Promise<IUserWishInfoAdd> {
    const individualProductId = params.productType === ProductType.INDIVIDUAL ? params.productId : null
    const comboProductId = params.productType === ProductType.COMBO ? params.productId : null

    if (individualProductId) {
      const productInfo = await this.productService.getIndividualProductInfo(individualProductId)
      this._checkProductSKU(productInfo)
    } else if (comboProductId) {
      const comboInfo = await this.productService.getComboProductInfo(comboProductId)
      this._checkProductSKU(comboInfo)
    }

    const userWishId = await this.getUserWishRepository().addUserWish({
      userId: userId,
      individualProductId: params.productType === ProductType.INDIVIDUAL ? params.productId : undefined,
      comboProductId: params.productType === ProductType.COMBO ? params.productId : undefined,
    })
    const userWishList = await this.getUserWishRepository().getBulkByUserId(userId, {})
    const userWish = userWishList.find(wish => wish.id === userWishId)
    return {
      success: true,
      userWish: userWish ? prepareUserWishInfo(userWish) : null,
    }
  }

  @CachePurge('WL', [[0]], 'WIL')
  public async deleteUserWishInfo(userId: number, userWishId: number): Promise<IUserWishInfoDelete> {
    await this.getUserWishRepository().deleteUserWish({
      userWishId: userWishId,
      userId: userId,
    })
    return {
      success: true,
    }
  }
}
