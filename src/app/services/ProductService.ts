import { injectable, inject } from 'inversify'
import BaseService from './BaseService'
import { IImageService, IProductElementService, IProductService } from './interface'
import { flattenList, isEmptyObject, uniqueList } from '../utils/common'
import { EntityNotFoundError } from '../errors/EntityError'
import {
  IIndividualProductInfo,
  IIndividualProductDetail,
  IComboProductInfo,
  IComboProductDetail,
  IProductsRelationInfo,
  IProductInfo,
  IIndividualProductDetailUpdateParams,
  IIndividualProductDetailUpdate,
  IComboProductDetailUpdateParams,
  IComboProductDetailUpdate,
  IIndividualProductDetailDeleteParams,
  IIndividualProductDetailDelete,
  IComboProductDetailDeleteParams,
  IComboProductDetailDelete,
} from '../contract/product'
import {
  prepareIndividualProductInfo,
  prepareIndividualProductDetail,
  prepareComboProductInfo,
  prepareComboProductDetail,
} from '../transformers/product'
import { IFindParams } from '../contract/common'
import IndividualProduct from '../models/IndividualProductModel'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import { ProductType } from '../contract/constants'
import ProductsRelation from '../models/ProductsRelationModel'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'

// These APIs are used at build time. Are also re-validated after few seconds. Hence, keeping cache time very low at API level.
@injectable()
export default class ProductService extends BaseService implements IProductService {
  @lazyInject(AppTypes.ProductElementService)
  private productElementService!: IProductElementService

  @lazyInject(AppTypes.ImageService)
  private imageService!: IImageService

  @CacheBulkBuild('PS', [[0], [1]], SERVICE_CACHE_TTL.DEFAULT, 'IPIS')
  private async _prepareIndividualProductState(
    isDetail: boolean,
    productIds: number[]
  ): Promise<Record<number, IIndividualProductInfo | IIndividualProductDetail>> {
    const products = isDetail
      ? await this.getIndividualProductRepository().getBulkDetail(productIds, {})
      : await this.getIndividualProductRepository().getBulkInfo(productIds, {})

    const result: Record<number, IIndividualProductInfo | IIndividualProductDetail> = {}
    const productRelationIdMap: Record<number, number> = {}
    let relationMap: Record<number, IProductsRelationInfo> = {}

    if (isDetail) {
      Object.values(products).forEach(product => {
        if (product.productsRelation) {
          productRelationIdMap[product.id] = product.productsRelation.id
        }
      })

      if (Object.keys(productRelationIdMap).length > 0) {
        relationMap = await this.productElementService.getProductsRelationInfoByIds(
          uniqueList(Object.values(productRelationIdMap))
        )
      }
    }

    for (const [productId, product] of Object.entries(products)) {
      let productInfo: any = {}

      if (isDetail) {
        const productDetail = prepareIndividualProductDetail(product)

        productInfo = {
          ...productDetail,
          productsRelation: relationMap[product.productsRelation?.id] || null,
        }
      } else {
        productInfo = prepareIndividualProductInfo(product)
      }

      result[productId] = productInfo
    }

    return result
  }

  @CacheBuild(
    'PS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'IPIL'
  )
  public async getAllIndividualProductInfos(findParams: IFindParams): Promise<IIndividualProductInfo[]> {
    const productIds = await this.getIndividualProductRepository().getBulkIds(findParams)

    if (!productIds.length) {
      return []
    }

    const products = await this._prepareIndividualProductState(false, productIds)
    return Object.values(products).sort((a, b) => a.position - b.position)
  }

  public async getIndividualProductInfo(id: number): Promise<IIndividualProductInfo> {
    const products = await this._prepareIndividualProductState(false, [id])
    const product = products[id]

    if (!product) {
      throw new EntityNotFoundError('Individual Product', id)
    }

    return product
  }

  public async getIndividualProductInfoByIds(ids: number[]): Promise<Record<number, IIndividualProductInfo>> {
    const products = await this._prepareIndividualProductState(false, ids)
    return products
  }

  public async getIndividualProductDetail(id: number): Promise<IIndividualProductDetail> {
    const products = await this._prepareIndividualProductState(true, [id])
    const productDetail = products[id] as IIndividualProductDetail

    if (!productDetail) {
      throw new EntityNotFoundError('Individual Product', id)
    }

    return productDetail
  }

  public async updateIndividualProductDetail(
    id: number | null,
    params: IIndividualProductDetailUpdateParams
  ): Promise<IIndividualProductDetailUpdate> {
    const result: IIndividualProductDetailUpdate = {
      success: false,
    }

    if (id) {
      if (params.sku) {
        await this.getProductSKURepository().updateProductSKU(id, ProductType.INDIVIDUAL, params.sku)
      }

      if (params.tags) {
        await this.getProductTagRepository().updateProductTag(id, ProductType.INDIVIDUAL, params.tags)
      }

      if (params.attributes) {
        await this.getProductAttributeRepository().updateProductAttribute(id, ProductType.INDIVIDUAL, params.attributes)
      }

      if (params.featureSections) {
        await this.getProductFeatureSectionRepository().updateProductFeatureSection(
          id,
          ProductType.INDIVIDUAL,
          params.featureSections
        )
      }

      await this.getIndividualProductRepository().updateIndividualProduct({
        id: id,
        ...params,
      })

      result.success = true
    } else {
      await this.getIndividualProductRepository().addIndividualProduct({
        id: id,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteIndividualProductDetail(
    productId: number,
    params: IIndividualProductDetailDeleteParams
  ): Promise<IIndividualProductDetailDelete> {
    const result: IIndividualProductDetailDelete = {
      success: false,
    }

    if (params.tags) {
      await this.getProductTagRepository().deleteBulk(productId, ProductType.INDIVIDUAL, params.tags)
    }
    if (params.attributes) {
      await this.getProductAttributeRepository().deleteBulk(productId, ProductType.INDIVIDUAL, params.attributes)
    }
    if (params.featureSections) {
      await this.getProductFeatureSectionRepository().deleteBulk(
        productId,
        ProductType.INDIVIDUAL,
        params.featureSections
      )
    }

    result.success = true

    return result
  }

  @CacheBuild('PS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'IPQS')
  public async getAllIndividualProductInfosByQuery(
    query: string,
    findParams: IFindParams
  ): Promise<IIndividualProductInfo[]> {
    const productIds = await this.getIndividualProductRepository().getBulkIdsByName(query, findParams)

    if (!productIds.length) {
      return []
    }

    const products = await this._prepareIndividualProductState(false, productIds)
    return Object.values(products).sort((a, b) => a.position - b.position)
  }

  @CacheBuild('PS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.DEFAULT, 'IPCL')
  public async getIndividualProductInfosByCatalogueId(
    catalogueId: number,
    findParams: IFindParams
  ): Promise<IIndividualProductInfo[]> {
    const catalogueProductsMap = await this.getIndividualProductRepository().getBulkIdsByCatalogueIds(
      [catalogueId],
      findParams
    )
    const catalogueProductIds = catalogueProductsMap[catalogueId] || []

    const products = await this._prepareIndividualProductState(false, catalogueProductIds)
    return Object.values(products).sort((a, b) => a.position - b.position)
  }

  @CacheBulkBuild('PS', [[0], [1]], SERVICE_CACHE_TTL.DEFAULT, 'CPIS')
  private async _prepareComboProductState(
    isDetail: boolean,
    productIds: number[]
  ): Promise<Record<number, IComboProductInfo | IComboProductDetail>> {
    const products = isDetail
      ? await this.getComboProductRepository().getBulkDetail(productIds, {})
      : await this.getComboProductRepository().getBulkInfo(productIds, {})

    const result: Record<number, IComboProductInfo | IComboProductDetail> = {}
    const productRelationIdMap: Record<number, number> = {}
    let relationMap: Record<number, IProductsRelationInfo> = {}

    if (isDetail) {
      Object.values(products).forEach(product => {
        if (product.productsRelation) {
          productRelationIdMap[product.id] = product.productsRelation.id
        }
      })

      if (Object.keys(productRelationIdMap).length > 0) {
        relationMap = await this.productElementService.getProductsRelationInfoByIds(
          uniqueList(Object.values(productRelationIdMap))
        )
      }
    }

    for (const [productId, product] of Object.entries(products)) {
      let productInfo: any = {}

      if (isDetail) {
        const productDetail = prepareComboProductDetail(product)

        productInfo = {
          ...productDetail,
          productsRelation: relationMap[product.productsRelation?.id] || null,
        }
      } else {
        productInfo = prepareComboProductInfo(product)
      }

      result[productId] = productInfo
    }

    return result
  }

  @CacheBuild(
    'PS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'CPIL'
  )
  public async getAllComboProductInfos(findParams: IFindParams): Promise<IComboProductInfo[]> {
    const productIds = await this.getComboProductRepository().getBulkIds(findParams)

    if (!productIds.length) {
      return []
    }

    const combos = await this._prepareComboProductState(false, productIds)
    return Object.values(combos).sort((a, b) => a.position - b.position)
  }

  public async getComboProductInfo(id: number): Promise<IComboProductInfo> {
    const combos = await this._prepareComboProductState(false, [id])
    const comboInfo = combos[id]

    if (!comboInfo) {
      throw new EntityNotFoundError('Combo Product', id)
    }

    return comboInfo
  }

  public async getComboProductInfoByIds(ids: number[]): Promise<Record<number, IComboProductInfo>> {
    const products = await this._prepareComboProductState(false, ids)
    return products
  }

  public async getComboProductDetail(id: number): Promise<IComboProductDetail> {
    const combos = await this._prepareComboProductState(true, [id])
    const comboDetail = combos[id] as IComboProductDetail

    if (!comboDetail) {
      throw new EntityNotFoundError('Combo Product', id)
    }

    return comboDetail
  }

  public async updateComboProductDetail(
    id: number | null,
    params: IComboProductDetailUpdateParams
  ): Promise<IComboProductDetailUpdate> {
    const result: IComboProductDetailUpdate = {
      success: false,
    }

    if (id) {
      if (params.sku) {
        await this.getProductSKURepository().updateProductSKU(id, ProductType.COMBO, params.sku)
      }

      if (params.tags) {
        await this.getProductTagRepository().updateProductTag(id, ProductType.COMBO, params.tags)
      }

      if (params.attributes) {
        await this.getProductAttributeRepository().updateProductAttribute(id, ProductType.COMBO, params.attributes)
      }

      if (params.featureSections) {
        await this.getProductFeatureSectionRepository().updateProductFeatureSection(
          id,
          ProductType.COMBO,
          params.featureSections
        )
      }

      await this.getComboProductRepository().updateComboProduct({
        id: id,
        ...params,
      })

      result.success = true
    } else {
      await this.getComboProductRepository().addComboProduct({
        id: id,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteComboProductDetail(
    productId: number,
    params: IComboProductDetailDeleteParams
  ): Promise<IComboProductDetailDelete> {
    const result: IComboProductDetailDelete = {
      success: false,
    }

    if (params.tags) {
      await this.getProductTagRepository().deleteBulk(productId, ProductType.COMBO, params.tags)
    }
    if (params.attributes) {
      await this.getProductAttributeRepository().deleteBulk(productId, ProductType.COMBO, params.attributes)
    }
    if (params.featureSections) {
      await this.getProductFeatureSectionRepository().deleteBulk(productId, ProductType.COMBO, params.featureSections)
    }

    result.success = true

    return result
  }

  @CacheBuild('PS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'CPQS')
  public async getAllComboProductInfosByQuery(query: string, findParams: IFindParams): Promise<IComboProductInfo[]> {
    const comboIds = await this.getComboProductRepository().getBulkIdsByName(query, findParams)

    if (!comboIds.length) {
      return []
    }

    const combos = await this._prepareComboProductState(false, comboIds)
    return Object.values(combos).sort((a, b) => a.position - b.position)
  }
}
