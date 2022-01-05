import { injectable, inject } from 'inversify'
import BaseService from './BaseService'
import { ISectionItemService, ISectionService } from './interface'
import {
  ISectionInfo,
  ISectionInfoProducts,
  ISectionInfoCatalogues,
  ISectionInfoBlogs,
  ISectionInfoFullWidthSlides,
  ISectionInfoStrictWidthSlides,
  ISectionInfoUSPs,
  ISectionInfoProcedures,
  ISectionInfoCustomerFeedbacks,
  ISectionInfoShare,
  ISectionInfoCustom,
  ISectionInfoUpdateParams,
  ISectionInfoUpdate,
  ISectionInfoDelete,
  IPageSectionInfoUpdateParams,
  IPageSectionInfoUpdate,
  IPageSectionInfoDelete,
} from '../contract/section'
import { PageSectionType, SectionType } from '../contract/constants'
import { IFindParams } from '../contract/common'
import { EntityNotFoundError } from '../errors/EntityError'
import { fallbackDeciderForEmptyString, generateSlug, isEmptyObject } from '../utils/common'
import appConfig from '../../appConfig'
import { prepareSectionInfo } from '../transformers/section'
import SectionPageHome from '../models/SectionPageHomeModel'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import IndividualProductSection from '../models/SectionPageIndividualProductModel'
import SectionPageComboProduct from '../models/SectionPageComboProductModel'
import SectionPageExplore from '../models/SectionPageExploreModel'
import SectionPageError from '../models/SectionPageError'
import SectionSearch from '../models/SectionPageSearchModel'
import { IPageSectionInfoUpdateCommand } from '../repositories/commands/section'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'

// These APIs are used at build time. Are also re-validated after few seconds. Hence, keeping cache time very low at API level.
@injectable()
export default class SectionService extends BaseService implements ISectionService {
  @lazyInject(AppTypes.SectionElementsService)
  private sectionElementsService!: ISectionItemService

  @CacheBulkBuild('SS', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.DEFAULT, 'SCIS')
  public async _prepareSectionInfoStates(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ISectionInfo>> {
    const result: Record<number, ISectionInfo> = {}

    const sections = await this.getSectionRepository().getBulk(sectionIds)

    const dataMap = {
      products: {},
      catalogues: {},
      blogs: {},
      slides: {},
      usps: {},
      procedures: {},
      customerFeedbacks: {},
      customBody: {},
    }

    Object.values(sections).forEach(section => {
      switch (section.type) {
        case SectionType.PRODUCTS:
          dataMap.products[section.id] = []
          break

        case SectionType.CATALOGUES:
          dataMap.catalogues[section.id] = []
          break

        case SectionType.BLOGS:
          dataMap.blogs[section.id] = []
          break

        case SectionType.FULL_WIDTH_SLIDES:
        case SectionType.STRICT_WIDTH_SLIDES:
          dataMap.slides[section.id] = []
          break

        case SectionType.USPS:
          dataMap.usps[section.id] = []
          break

        case SectionType.PROCEDURES:
          dataMap.procedures[section.id] = []
          break

        case SectionType.CUSTOMER_FEEDBACKS:
          dataMap.customerFeedbacks[section.id] = []
          break

        case SectionType.CUSTOM:
          dataMap.customBody[section.id] = []
          break
      }
    })

    if (!isEmptyObject(dataMap.products)) {
      dataMap.products = await this.sectionElementsService.getProductSectionInfosBySectionIds(
        findParams,
        Object.keys(dataMap.products) as any[]
      )
    }
    if (!isEmptyObject(dataMap.catalogues)) {
      dataMap.catalogues = await this.sectionElementsService.getCatalogueSectionInfosBySectionIds(
        findParams,
        Object.keys(dataMap.catalogues) as any[]
      )
    }
    if (!isEmptyObject(dataMap.blogs)) {
      dataMap.blogs = await this.sectionElementsService.getSectionBlogInfosBySectionIds(
        findParams,
        Object.keys(dataMap.blogs) as any[]
      )
    }
    if (!isEmptyObject(dataMap.slides)) {
      dataMap.slides = await this.sectionElementsService.getSlideInfosBySectionsIds(
        findParams,
        Object.keys(dataMap.slides) as any[]
      )
    }
    if (!isEmptyObject(dataMap.usps)) {
      dataMap.usps = await this.sectionElementsService.getUSPInfosBySectionIds(
        findParams,
        Object.keys(dataMap.usps) as any[]
      )
    }
    if (!isEmptyObject(dataMap.procedures)) {
      dataMap.procedures = await this.sectionElementsService.getProcedureInfosBySectionsIds(
        findParams,
        Object.keys(dataMap.procedures) as any[]
      )
    }
    if (!isEmptyObject(dataMap.customerFeedbacks)) {
      dataMap.customerFeedbacks = await this.sectionElementsService.getCustomerFeedbackInfosBySectionIds(
        findParams,
        Object.keys(dataMap.customerFeedbacks) as any[]
      )
    }
    if (!isEmptyObject(dataMap.customBody)) {
      dataMap.customBody = await this.sectionElementsService.getCustomBodyInfosBySectionIds(
        findParams,
        Object.keys(dataMap.customBody) as any[]
      )
    }

    for (const section of Object.values(sections)) {
      const sectionInfo = prepareSectionInfo(section)

      switch (section.type) {
        case SectionType.PRODUCTS:
          const sectionInfoDeals = sectionInfo as ISectionInfoProducts
          sectionInfoDeals.type = SectionType.PRODUCTS
          sectionInfoDeals.products = dataMap.products[section.id] || []
          break

        case SectionType.CATALOGUES:
          const sectionInfoCatalogues = sectionInfo as ISectionInfoCatalogues
          sectionInfoCatalogues.type = SectionType.CATALOGUES
          sectionInfoCatalogues.catalogues = dataMap.catalogues[section.id] || []
          break

        case SectionType.BLOGS:
          const sectionInfoBlogs = sectionInfo as ISectionInfoBlogs
          sectionInfoBlogs.type = SectionType.BLOGS
          sectionInfoBlogs.blogs = dataMap.blogs[section.id] || []
          break

        case SectionType.FULL_WIDTH_SLIDES:
          const sectionInfoFlexibleSlides = sectionInfo as ISectionInfoFullWidthSlides
          sectionInfoFlexibleSlides.type = SectionType.FULL_WIDTH_SLIDES
          sectionInfoFlexibleSlides.slides = dataMap.slides[section.id] || []
          break

        case SectionType.STRICT_WIDTH_SLIDES:
          const sectionInfoStrictSlides = sectionInfo as ISectionInfoStrictWidthSlides
          sectionInfoStrictSlides.type = SectionType.STRICT_WIDTH_SLIDES
          sectionInfoStrictSlides.slides = dataMap.slides[section.id] || []
          break

        case SectionType.USPS:
          const sectionInfoUSPs = sectionInfo as ISectionInfoUSPs
          sectionInfoUSPs.type = SectionType.USPS
          sectionInfoUSPs.uspList = dataMap.usps[section.id] || []
          break

        case SectionType.PROCEDURES:
          const sectionInfoProcedures = sectionInfo as ISectionInfoProcedures
          sectionInfoProcedures.type = SectionType.PROCEDURES
          sectionInfoProcedures.procedures = dataMap.procedures[section.id] || []
          break

        case SectionType.CUSTOMER_FEEDBACKS:
          const sectionInfoCustomerFeedbacks = sectionInfo as ISectionInfoCustomerFeedbacks
          sectionInfoCustomerFeedbacks.type = SectionType.CUSTOMER_FEEDBACKS
          sectionInfoCustomerFeedbacks.customerFeedbacks = dataMap.customerFeedbacks[section.id] || []
          break

        case SectionType.SHARE:
          const sectionInfoCustomerShare = sectionInfo as ISectionInfoShare
          sectionInfoCustomerShare.type = SectionType.SHARE
          break

        case SectionType.CUSTOM:
          const sectionInfoCustom = sectionInfo as ISectionInfoCustom
          sectionInfoCustom.type = SectionType.CUSTOM
          sectionInfoCustom.bodyList = dataMap.customBody[section.id] || []
          break
      }

      result[section.id] = sectionInfo
    }

    return result
  }

  @CacheBuild(
    'SS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.LONG,
    'SCIL'
  )
  public async getAllSectionInfos(findParams: IFindParams): Promise<ISectionInfo[]> {
    const sectionIds = await this.getSectionRepository().getBulkIds(findParams)
    const sections = await this._prepareSectionInfoStates(
      {
        limit: appConfig.global.pageSectionItemsLimit,
      },
      sectionIds
    )
    return Object.values(sections).sort((a, b) => {
      if (a.position && b.position) {
        return a.position - b.position
      }
      return 0
    })
  }

  public async getSectionInfoById(id: number): Promise<ISectionInfo> {
    const sections = await this._prepareSectionInfoStates({}, [id])
    const sectionInfo = sections[id]

    if (!sectionInfo) {
      throw new EntityNotFoundError('Section', id)
    }

    return sectionInfo
  }

  public async updateSectionInfo(
    sectionId: number | null,
    params: ISectionInfoUpdateParams
  ): Promise<ISectionInfoUpdate> {
    const result: ISectionInfoUpdate = {
      success: false,
    }

    if (sectionId) {
      await this.getSectionRepository().updateSection({
        id: sectionId,
        ...params,
      })
      result.success = true
    } else {
      await this.getSectionRepository().addSection({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteSectionInfo(sectionId: number): Promise<ISectionInfoDelete> {
    const result: ISectionInfoDelete = {
      success: false,
    }

    await this.getSectionRepository().deleteSection(sectionId)
    result.success = true

    return result
  }

  private async _preparePageSections(
    pageSections: Record<
      number,
      | SectionPageHome
      | IndividualProductSection
      | SectionPageComboProduct
      | SectionPageExplore
      | SectionPageError
      | SectionSearch
    >
  ): Promise<ISectionInfo[]> {
    const result: ISectionInfo[] = []

    const sections = await this._prepareSectionInfoStates(
      {
        limit: appConfig.global.pageSectionItemsLimit,
      },
      Object.keys(pageSections) as any[]
    )

    Object.entries(sections).forEach(([sectionId, section]) => {
      const pageSection = pageSections[sectionId]

      let showDivider = false

      if (pageSection.showDivider !== null) {
        showDivider = !!pageSection.showDivider
      } else {
        showDivider = !!section.showDivider
      }

      const sectionInfo: ISectionInfo = {
        ...section,
        title: fallbackDeciderForEmptyString(pageSection.title, section.title),
        subTitle: fallbackDeciderForEmptyString(pageSection.subTitle, section.subTitle),
        showMoreUrl: pageSection.showMoreUrl || section.showMoreUrl,
        showDivider: showDivider,
        position: pageSection.position,
        pageSection: {
          id: pageSection.id,
        },
      }

      result.push(sectionInfo)
    })

    return result.sort((a, b) => {
      if (a.position && b.position) {
        return a.position - b.position
      }
      return 0
    })
  }

  @CacheBuild('SS', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'PSIL')
  public async getAllPageSections(pageType: PageSectionType): Promise<ISectionInfo[]> {
    let pageSections: Record<number, any> = {}

    if (pageType === PageSectionType.HOME) {
      pageSections = await this.getSectionPageHomeRepository().getBulkBySectionId([])
    }
    if (pageType === PageSectionType.INDIVIDUAL_PRODUCT) {
      pageSections = await this.getSectionPageIndividualProductRepository().getBulkBySectionId([])
    }
    if (pageType === PageSectionType.COMBO_PRODUCT) {
      pageSections = await this.getSectionPageComboProductRepository().getBulkBySectionId([])
    }
    if (pageType === PageSectionType.EXPLORE) {
      pageSections = await this.getSectionPageExploreRepository().getBulkBySectionId([])
    }
    if (pageType === PageSectionType.ERROR) {
      pageSections = await this.getSectionPageErrorRepository().getBulkBySectionId([])
    }
    if (pageType === PageSectionType.SEARCH) {
      pageSections = await this.getSectionPageSearchRepository().getBulkBySectionId([])
    }

    const sections = await this._preparePageSections(pageSections)
    return sections
  }

  public async getPageSectionInfoById(id: number, pageType: PageSectionType): Promise<ISectionInfo> {
    let pageSections: Record<number, any> = {}

    if (pageType === PageSectionType.HOME) {
      pageSections = await this.getSectionPageHomeRepository().getBulkBySectionId([id])
    }
    if (pageType === PageSectionType.INDIVIDUAL_PRODUCT) {
      pageSections = await this.getSectionPageIndividualProductRepository().getBulkBySectionId([id])
    }
    if (pageType === PageSectionType.COMBO_PRODUCT) {
      pageSections = await this.getSectionPageComboProductRepository().getBulkBySectionId([id])
    }
    if (pageType === PageSectionType.EXPLORE) {
      pageSections = await this.getSectionPageExploreRepository().getBulkBySectionId([id])
    }
    if (pageType === PageSectionType.ERROR) {
      pageSections = await this.getSectionPageErrorRepository().getBulkBySectionId([id])
    }
    if (pageType === PageSectionType.SEARCH) {
      pageSections = await this.getSectionPageSearchRepository().getBulkBySectionId([id])
    }

    const pageSection = Object.values(pageSections).find(l => Number(l.id) === Number(id))

    if (!pageSection) {
      throw new EntityNotFoundError(`Page Section - ${pageType}`, id)
    }

    const sections = await this._preparePageSections(pageSections)
    return sections[0]
  }

  public async updatePageSectionInfo(
    id: number | null,
    pageType: PageSectionType,
    params: IPageSectionInfoUpdateParams
  ): Promise<IPageSectionInfoUpdate> {
    const result: IPageSectionInfoUpdate = {
      success: false,
    }

    const updateParams: IPageSectionInfoUpdateCommand = {
      id: id,
      ...params,
    }

    if (id) {
      if (pageType === PageSectionType.HOME) {
        await this.getSectionPageHomeRepository().updateSection(updateParams)
      }
      if (pageType === PageSectionType.INDIVIDUAL_PRODUCT) {
        await this.getSectionPageIndividualProductRepository().updateSection(updateParams)
      }
      if (pageType === PageSectionType.COMBO_PRODUCT) {
        await this.getSectionPageComboProductRepository().updateSection(updateParams)
      }
      if (pageType === PageSectionType.EXPLORE) {
        await this.getSectionPageExploreRepository().updateSection(updateParams)
      }
      if (pageType === PageSectionType.ERROR) {
        await this.getSectionPageErrorRepository().updateSection(updateParams)
      }
      if (pageType === PageSectionType.SEARCH) {
        await this.getSectionPageSearchRepository().updateSection(updateParams)
      }
    } else {
      if (pageType === PageSectionType.HOME) {
        await this.getSectionPageHomeRepository().addSection(updateParams)
      }
      if (pageType === PageSectionType.INDIVIDUAL_PRODUCT) {
        await this.getSectionPageIndividualProductRepository().addSection(updateParams)
      }
      if (pageType === PageSectionType.COMBO_PRODUCT) {
        await this.getSectionPageComboProductRepository().addSection(updateParams)
      }
      if (pageType === PageSectionType.EXPLORE) {
        await this.getSectionPageExploreRepository().addSection(updateParams)
      }
      if (pageType === PageSectionType.ERROR) {
        await this.getSectionPageErrorRepository().addSection(updateParams)
      }
      if (pageType === PageSectionType.SEARCH) {
        await this.getSectionPageSearchRepository().addSection(updateParams)
      }
    }

    result.success = true

    return result
  }

  public async deletePageSectionInfo(id: number, pageType: PageSectionType): Promise<IPageSectionInfoDelete> {
    const result: IPageSectionInfoDelete = {
      success: false,
    }

    if (pageType === PageSectionType.HOME) {
      await this.getSectionPageHomeRepository().deleteSection(id)
    }
    if (pageType === PageSectionType.INDIVIDUAL_PRODUCT) {
      await this.getSectionPageIndividualProductRepository().deleteSection(id)
    }
    if (pageType === PageSectionType.COMBO_PRODUCT) {
      await this.getSectionPageComboProductRepository().deleteSection(id)
    }
    if (pageType === PageSectionType.EXPLORE) {
      await this.getSectionPageExploreRepository().deleteSection(id)
    }
    if (pageType === PageSectionType.ERROR) {
      await this.getSectionPageErrorRepository().deleteSection(id)
    }
    if (pageType === PageSectionType.SEARCH) {
      await this.getSectionPageSearchRepository().deleteSection(id)
    }

    result.success = true

    return result
  }
}
