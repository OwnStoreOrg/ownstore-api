import { inject, injectable } from 'inversify'
import AppTypes from '../AppTypes'
import { SERVICE_CACHE_TTL } from '../constants'
import { lazyInject } from '../container'
import { ICartDetail, IUserCartItemAdd, IUserCartItemAddParams, IUserCartItemDelete } from '../contract/cart'
import { ProductType } from '../contract/constants'
import { IComboProductInfo, IIndividualProductInfo } from '../contract/product'
import { CacheBuild, CachePurge } from '../decorators/cache'
import AppError from '../errors/AppError'
import { prepareCartDetail, prepareCartItem } from '../transformers/cart'
import BaseService from './BaseService'
import { ICartService, IProductService } from './interface'

@injectable()
export default class CartService extends BaseService implements ICartService {
  @lazyInject(AppTypes.ProductService)
  private productService!: IProductService

  @CacheBuild('CS', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'USCD')
  public async getUserCartDetail(userId: number): Promise<ICartDetail> {
    const cartItems = await this.getUserCartItemRepository().getBulkByUser(userId)
    const cartDetail = prepareCartDetail(cartItems)
    return cartDetail
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

  @CachePurge('CS', [[0]], 'USCD')
  public async addUserCartItem(userId: number, params: IUserCartItemAddParams): Promise<IUserCartItemAdd> {
    const individualProductId = params.productType === ProductType.INDIVIDUAL ? params.productId : null
    const comboProductId = params.productType === ProductType.COMBO ? params.productId : null

    if (individualProductId) {
      const productInfo = await this.productService.getIndividualProductInfo(individualProductId)
      this._checkProductSKU(productInfo)
    } else if (comboProductId) {
      const comboInfo = await this.productService.getComboProductInfo(comboProductId)
      this._checkProductSKU(comboInfo)
    }

    const result: IUserCartItemAdd = {
      success: false,
      cartItem: null,
    }

    const productCount = await this.getUserCartItemRepository().getCountByUserAndProduct(
      userId,
      individualProductId,
      comboProductId
    )

    const alreadyInCart = productCount > 0

    if (alreadyInCart) {
      await this.getUserCartItemRepository().updateCartByProduct({
        userId: userId,
        individualProductId: individualProductId,
        comboProductId: comboProductId,
        totalQuantity: params.totalQuantity,
      })
      result.success = true
    } else {
      const cartId = await this.getUserCartItemRepository().addCart({
        userId: userId,
        individualProductId: individualProductId,
        comboProductId: comboProductId,
        totalQuantity: params.totalQuantity,
      })

      const userCartItems = await this.getUserCartItemRepository().getBulkByUser(userId)
      const cart = userCartItems.find(cartItem => cartItem.id === cartId)
      result.success = true
      if (cart) {
        result.cartItem = prepareCartItem(cart)
      }
    }

    return result
  }

  @CachePurge('CS', [[0]], 'USCD')
  public async deleteUserCartItem(userId: number, cartId?: number): Promise<IUserCartItemDelete> {
    await this.getUserCartItemRepository().deleteCart({
      userId: userId,
      cartId: cartId,
    })

    return {
      success: true,
    }
  }
}
