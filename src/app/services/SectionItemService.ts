import { injectable, inject } from 'inversify'
import BaseService from './BaseService'
import { IBlogService, ICatalogueService, IProductService, ISectionItemService, ISectionService } from './interface'
import {
  ISlideInfo,
  IUSPInfo,
  IProcedureInfo,
  ICustomerFeedbackInfo,
  ICustomSectionBody,
  ICatalogueSectionInfo,
  IBlogSectionInfo,
  ICatalogueSectionInfoUpdateParams,
  ICatalogueSectionInfoUpdate,
  ICatalogueSectionInfoDelete,
  IBlogSectionInfoUpdateParams,
  IBlogSectionInfoUpdate,
  IBlogSectionInfoDelete,
  ISlideInfoUpdateParams,
  ISlideInfoUpdate,
  ISlideInfoDelete,
  IUSPInfoUpdateParams,
  IUSPInfoUpdate,
  IUSPInfoDelete,
  IProcedureInfoUpdateParams,
  IProcedureInfoUpdate,
  IProcedureInfoDelete,
  ICustomerFeedbackInfoUpdateParams,
  ICustomerFeedbackInfoUpdate,
  ICustomerFeedbackInfoDelete,
  ICustomSectionBodyUpdateParams,
  ICustomSectionBodyUpdate,
  ICustomSectionBodyDelete,
  IProductSectionInfo,
  IProductSectionInfoUpdate,
  IProductSectionInfoUpdateParams,
  IProductSectionInfoDelete,
} from '../contract/section'
import { IFindParams } from '../contract/common'
import {
  prepareSlideInfo,
  prepareCustomerFeedbackInfo,
  prepareCustomSectionBody,
  prepareProcedureInfo,
  prepareUSPInfo,
  prepareCatalogueSectionInfo,
  prepareBlogSectionInfo,
  prepareProductSectionInfo,
} from '../transformers/section'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import { uniqueList } from '../utils/common'
import { lazyInject } from '../container'
import AppTypes from '../AppTypes'
import { IProductInfo } from '../contract/product'
import { ProductType } from '../contract/constants'

// These APIs are used at build time. Are also re-validated after few seconds. Hence, keeping cache time very low at API level.
@injectable()
export default class SectionService extends BaseService implements ISectionItemService {
  @lazyInject(AppTypes.CatalogueService)
  private catalogueService!: ICatalogueService

  @lazyInject(AppTypes.BlogService)
  private blogService!: IBlogService

  @lazyInject(AppTypes.ProductService)
  private productService!: IProductService

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'SLSI')
  public async getSlideInfosBySectionsIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ISlideInfo[]>> {
    const result: Record<number, ISlideInfo[]> = {}

    const slides = await this.getSectionSlideRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(slides).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareSlideInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateSlideInfo(
    sectionId: number,
    slideId: number | number,
    params: ISlideInfoUpdateParams
  ): Promise<ISlideInfoUpdate> {
    const result: ISlideInfoUpdate = {
      success: false,
    }

    if (slideId) {
      await this.getSectionSlideRepository().updateSlide({
        id: slideId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionSlideRepository().addSlide({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteSlideInfo(sectionId: number, slideId: number): Promise<ISlideInfoDelete> {
    const result: ISlideInfoDelete = {
      success: false,
    }

    await this.getSectionSlideRepository().deleteSlide(slideId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'USSI')
  public async getUSPInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IUSPInfo[]>> {
    const result: Record<number, IUSPInfo[]> = {}

    const uspList = await this.getSectionUSPRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(uspList).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareUSPInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateUSPInfo(
    sectionId: number,
    uspId: number | number,
    params: IUSPInfoUpdateParams
  ): Promise<IUSPInfoUpdate> {
    const result: ISlideInfoUpdate = {
      success: false,
    }

    if (uspId) {
      await this.getSectionUSPRepository().updateUSP({
        id: uspId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionUSPRepository().addUSP({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteUSPInfo(sectionId: number, uspId: number): Promise<IUSPInfoDelete> {
    const result: ISlideInfoDelete = {
      success: false,
    }

    await this.getSectionSlideRepository().deleteSlide(uspId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'PRSI')
  public async getProcedureInfosBySectionsIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IProcedureInfo[]>> {
    const result: Record<number, IProcedureInfo[]> = {}

    const procedures = await this.getSectionProcedureRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(procedures).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareProcedureInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateProcedureInfo(
    sectionId: number,
    procedureId: number | number,
    params: IProcedureInfoUpdateParams
  ): Promise<IProcedureInfoUpdate> {
    const result: IProcedureInfoUpdate = {
      success: false,
    }

    if (procedureId) {
      await this.getSectionProcedureRepository().updateProcedure({
        id: procedureId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionProcedureRepository().addProcedure({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteProcedureInfo(sectionId: number, procedureId: number): Promise<IProcedureInfoDelete> {
    const result: ISlideInfoDelete = {
      success: false,
    }

    await this.getSectionSlideRepository().deleteSlide(procedureId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'CFSI')
  public async getCustomerFeedbackInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICustomerFeedbackInfo[]>> {
    const result: Record<number, ICustomerFeedbackInfo[]> = {}

    const customerFeedbacks = await this.getSectionCustomerFeedbackRepository().getBulkBySectionIds(
      sectionIds,
      findParams
    )

    Object.entries(customerFeedbacks).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareCustomerFeedbackInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateCustomerFeedbackInfo(
    sectionId: number,
    feedbackId: number | number,
    params: ICustomerFeedbackInfoUpdateParams
  ): Promise<ICustomerFeedbackInfoUpdate> {
    const result: ICustomerFeedbackInfoUpdate = {
      success: false,
    }

    if (feedbackId) {
      await this.getSectionCustomerFeedbackRepository().updateCustomerFeedback({
        id: feedbackId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionCustomerFeedbackRepository().addCustomerFeedback({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteCustomerFeedbackInfo(sectionId: number, feedbackId: number): Promise<ICustomerFeedbackInfoDelete> {
    const result: ICustomerFeedbackInfoDelete = {
      success: false,
    }

    await this.getSectionSlideRepository().deleteSlide(feedbackId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'CBSI')
  public async getCustomBodyInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICustomSectionBody[]>> {
    const result: Record<number, ICustomSectionBody[]> = {}

    const customSections = await this.getSectionCustomRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(customSections).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareCustomSectionBody).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateCustomSectionBodyInfo(
    sectionId: number,
    customSectionId: number | number,
    params: ICustomSectionBodyUpdateParams
  ): Promise<ICustomSectionBodyUpdate> {
    const result: ICustomerFeedbackInfoUpdate = {
      success: false,
    }

    if (customSectionId) {
      await this.getSectionCustomRepository().updateCustomSectionBody({
        id: customSectionId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionCustomRepository().addCustomSectionBody({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteCustomSectionBodyInfo(
    sectionId: number,
    customSectionId: number
  ): Promise<ICustomSectionBodyDelete> {
    const result: ICustomerFeedbackInfoDelete = {
      success: false,
    }

    await this.getSectionCustomRepository().deleteCustomSectionBody(customSectionId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'DLSI')
  public async getProductSectionInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IProductSectionInfo[]>> {
    const result: Record<number, IProductSectionInfo[]> = {}
    const deals = await this.getSectionProductRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(deals).forEach(([sectionId, sections]) => {
      result[sectionId] = sections.map(prepareProductSectionInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateProductSection(
    sectionId: number,
    dealId: number | number,
    params: IProductSectionInfoUpdateParams
  ): Promise<IProductSectionInfoUpdate> {
    const result: IProductSectionInfoUpdate = {
      success: false,
    }

    if (dealId) {
      await this.getSectionProductRepository().updateProductSection({
        id: dealId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionProductRepository().addProductSection({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteProductSection(sectionId: number, dealId: number): Promise<IProductSectionInfoDelete> {
    const result: IProductSectionInfoDelete = {
      success: false,
    }

    await this.getSectionProductRepository().deleteProductSection(dealId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'CTSI')
  public async getCatalogueSectionInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICatalogueSectionInfo[]>> {
    const result: Record<number, ICatalogueSectionInfo[]> = {}
    const catalogues = await this.getSectionCatalogueRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(catalogues).forEach(([sectionId, sections]) => {
      result[sectionId] = sections
        .map(section => prepareCatalogueSectionInfo(section))
        .sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateCatalogueSectionInfo(
    sectionId: number,
    catalogueSectionId: number | number,
    params: ICatalogueSectionInfoUpdateParams
  ): Promise<ICatalogueSectionInfoUpdate> {
    const result: ICatalogueSectionInfoUpdate = {
      success: false,
    }

    if (catalogueSectionId) {
      await this.getSectionCatalogueRepository().updateCatalogueSection({
        id: catalogueSectionId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionCatalogueRepository().addCatalogueSection({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteCatalogueSectionInfo(
    sectionId: number,
    catalogueSectionId: number
  ): Promise<ICatalogueSectionInfoDelete> {
    const result: ICatalogueSectionInfoDelete = {
      success: false,
    }

    await this.getSectionCatalogueRepository().deleteCatalogueSection(catalogueSectionId)
    result.success = true

    return result
  }

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'BLSI')
  public async getSectionBlogInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IBlogSectionInfo[]>> {
    const result: Record<number, IBlogSectionInfo[]> = {}
    const blogs = await this.getSectionBlogRepository().getBulkBySectionIds(sectionIds, findParams)

    Object.entries(blogs).forEach(([sectionId, sections]) => {
      result[sectionId] = sections
        .map(section => prepareBlogSectionInfo(section))
        .sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async updateBlogSectionInfo(
    sectionId: number,
    blogSectionId: number | number,
    params: IBlogSectionInfoUpdateParams
  ): Promise<IBlogSectionInfoUpdate> {
    const result: IBlogSectionInfoUpdate = {
      success: false,
    }

    if (blogSectionId) {
      await this.getSectionBlogRepository().updateBlogSection({
        id: blogSectionId,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionBlogRepository().addBlogSection({
        id: null,
        sectionId: sectionId,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteBlogSectionInfo(sectionId: number, blogSectionId: number): Promise<IBlogSectionInfoDelete> {
    const result: IBlogSectionInfoDelete = {
      success: false,
    }

    await this.getSectionBlogRepository().deleteBlogSection(blogSectionId)
    result.success = true

    return result
  }
}
