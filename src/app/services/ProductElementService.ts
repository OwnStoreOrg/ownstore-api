import { inject, injectable } from 'inversify'
import AppTypes from '../AppTypes'
import { SERVICE_CACHE_TTL } from '../constants'
import { lazyInject } from '../container'
import { IFindParams } from '../contract/common'
import { ProductType } from '../contract/constants'
import {
  IProductAttributeKeyInfo,
  IProductAttributeKeyInfoDelete,
  IProductAttributeKeyInfoUpdate,
  IProductAttributeKeyInfoUpdateParams,
  IProductBrandInfo,
  IProductBrandInfoDelete,
  IProductBrandInfoUpdate,
  IProductBrandInfoUpdateParams,
  IProductsRelationInfo,
  IProductsRelationInfoDelete,
  IProductsRelationInfoUpdate,
  IProductsRelationInfoUpdateParams,
} from '../contract/product'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { EntityNotFoundError } from '../errors/EntityError'
import { prepareProductAttributeKeyInfo, prepareProductBrandInfo } from '../transformers/product'
import BaseService from './BaseService'
import { IProductElementService, IProductService } from './interface'

@injectable()
export default class ProductElementService extends BaseService implements IProductElementService {
  @lazyInject(AppTypes.ProductService)
  private productService!: IProductService

  @CacheBulkBuild('PE', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'PBIS')
  private async _prepareBrandState(brandIds: number[]): Promise<Record<number, IProductBrandInfo>> {
    const result: Record<number, IProductBrandInfo> = {}

    const brandMap = await this.getProductBrandRepository().getBulk(brandIds)

    Object.entries(brandMap).forEach(([brandId, brand]) => {
      result[brandId] = prepareProductBrandInfo(brand)
    })

    return result
  }

  @CacheBuild(
    'PE',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'PBIL'
  )
  public async getAllProductBrandInfos(findParams: IFindParams): Promise<IProductBrandInfo[]> {
    const brandIds = await this.getProductBrandRepository().getBulkIds(findParams)
    const brandInfos = await this._prepareBrandState(brandIds)
    return Object.values(brandInfos)
  }

  public async getProductBrandInfo(id: number): Promise<IProductBrandInfo> {
    const brands = await this._prepareBrandState([id])
    const brandInfo = brands[id]

    if (!brandInfo) {
      throw new EntityNotFoundError('ProductBrand', id)
    }

    return brandInfo
  }

  public async updateProductBrandInfo(
    id: number | null,
    params: IProductBrandInfoUpdateParams
  ): Promise<IProductBrandInfoUpdate> {
    const result: IProductBrandInfoUpdate = {
      success: false,
    }

    await this.getProductBrandRepository().saveBrand({
      id: id,
      ...params,
    })

    result.success = true

    return result
  }

  public async deleteProductBrandInfo(id: number): Promise<IProductBrandInfoDelete> {
    const result: IProductBrandInfoDelete = {
      success: false,
    }

    await this.getProductBrandRepository().deleteBrand(id)
    result.success = true

    return result
  }

  @CacheBulkBuild('PE', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'PKIS')
  private async _prepareAttributeKeyState(
    attributeKeyIds: number[]
  ): Promise<Record<number, IProductAttributeKeyInfo>> {
    const result: Record<number, IProductAttributeKeyInfo> = {}

    const brandMap = await this.getProductAttributeKeyRepository().getBulk(attributeKeyIds)

    Object.entries(brandMap).forEach(([attributeKeyId, attributeKey]) => {
      result[attributeKeyId] = prepareProductAttributeKeyInfo(attributeKey)
    })

    return result
  }

  @CacheBuild(
    'PE',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'PKIL'
  )
  public async getAllProductAttributeKeyInfos(findParams: IFindParams): Promise<IProductAttributeKeyInfo[]> {
    const attributeKeyIds = await this.getProductAttributeKeyRepository().getBulkIds(findParams)
    const attributeKeyInfos = await this._prepareAttributeKeyState(attributeKeyIds)
    return Object.values(attributeKeyInfos)
  }

  public async getProductAttributeKeyInfo(id: number): Promise<IProductAttributeKeyInfo> {
    const attributeKeys = await this._prepareAttributeKeyState([id])
    const attributeKeyInfo = attributeKeys[id]

    if (!attributeKeyInfo) {
      throw new EntityNotFoundError('Product Attribute Key', id)
    }

    return attributeKeyInfo
  }

  public async updateProductAttributeKeyInfo(
    id: number | null,
    params: IProductAttributeKeyInfoUpdateParams
  ): Promise<IProductAttributeKeyInfoUpdate> {
    const result: IProductAttributeKeyInfoUpdate = {
      success: false,
    }

    await this.getProductAttributeKeyRepository().saveAttributeKey({
      id: id,
      ...params,
    })

    result.success = true

    return result
  }

  public async deleteProductAttributeKeyInfo(id: number): Promise<IProductAttributeKeyInfoDelete> {
    const result: IProductAttributeKeyInfoDelete = {
      success: false,
    }

    await this.getProductAttributeKeyRepository().deleteAttributeKey(id)
    result.success = true

    return result
  }

  @CacheBulkBuild('PS', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'PRIS')
  private async _prepareProductsRelationState(relationIds: number[]): Promise<Record<number, IProductsRelationInfo>> {
    const result: Record<number, IProductsRelationInfo> = {}

    const relationMap = await this.getProductsRelationRepository().getBulk(relationIds)

    for (const [relationId, relation] of Object.entries(relationMap)) {
      const productMetas = relation.relatedProductIds.split(',').map(relatedId => {
        const productId = relatedId.trim().slice(2)
        return {
          id: Number(productId),
          productType: relatedId.trim().startsWith('I:') ? ProductType.INDIVIDUAL : ProductType.COMBO,
        }
      })

      const relatedProducts: any = []

      for (const productMeta of productMetas) {
        if (productMeta.productType === ProductType.INDIVIDUAL) {
          relatedProducts.push(await this.productService.getIndividualProductInfo(productMeta.id))
        } else {
          relatedProducts.push(await this.productService.getComboProductInfo(productMeta.id))
        }
      }

      result[relationId] = {
        id: relation.id,
        name: relation.name,
        description: relation.description,
        products: relatedProducts,
        productIds: relation.relatedProductIds,
      }
    }

    return result
  }

  @CacheBuild(
    'PE',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'PRIL'
  )
  public async getAllProductsRelationInfos(findParams: IFindParams): Promise<IProductsRelationInfo[]> {
    const relationIds = await this.getProductsRelationRepository().getBulkIds(findParams)
    const relationInfos = await this._prepareProductsRelationState(relationIds)
    return Object.values(relationInfos)
  }

  public async getProductsRelationInfo(id: number): Promise<IProductsRelationInfo> {
    const relationKeys = await this._prepareProductsRelationState([id])
    const relationKeyInfo = relationKeys[id]

    if (!relationKeyInfo) {
      throw new EntityNotFoundError('Products Relation', id)
    }

    return relationKeyInfo
  }

  public async getProductsRelationInfoByIds(ids: number[]): Promise<Record<number, IProductsRelationInfo>> {
    const relations = await this._prepareProductsRelationState(ids)
    return relations
  }

  public async updateProductsRelationInfo(
    id: number | null,
    params: IProductsRelationInfoUpdateParams
  ): Promise<IProductsRelationInfoUpdate> {
    const result: IProductsRelationInfoUpdate = {
      success: false,
    }

    await this.getProductsRelationRepository().saveProductsRelation({
      id: id,
      ...params,
    })

    result.success = true

    return result
  }

  public async deleteProductsRelationInfo(id: number): Promise<IProductsRelationInfoDelete> {
    const result: IProductsRelationInfoDelete = {
      success: false,
    }

    await this.getProductsRelationRepository().deleteProductsRelation(id)
    result.success = true

    return result
  }
}
