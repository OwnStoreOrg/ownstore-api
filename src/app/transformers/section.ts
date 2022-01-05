import {
  ISlideInfo,
  ICustomerFeedbackInfo,
  ICustomSectionBody,
  IProcedureInfo,
  IUSPInfo,
  ISectionInfo,
  ICatalogueSectionInfo,
  IBlogSectionInfo,
  IProductSectionInfo,
} from '../contract/section'
import SectionSlide from '../models/SectionSlideModel'
import SectionCustomerFeedback from '../models/SectionCustomerFeedbackModel'
import SectionCustom from '../models/SectionCustomModel'
import SectionProcedure from '../models/SectionProcedureModel'
import SectionUSP from '../models/SectionUSPModel'
import Section from '../models/SectionModel'
import { generateSlug } from '../utils/common'
import { SectionType } from '../contract/constants'
import SectionCatalogue from '../models/SectionCatalogueModel'
import { prepareCatalogueInfo } from './catalogue'
import SectionBlog from '../models/SectionBlogModel'
import { prepareBlogInfo } from './blog'
import { prepareImageInfo } from './image'
import { prepareProductInfo } from './product'
import SectionProduct from '../models/SectionProductModel'

export const prepareSectionInfo = (section: Section): ISectionInfo => {
  return {
    id: section.id,
    name: section.name,
    title: section.title,
    slug: generateSlug(section.name),
    subTitle: section.subTitle,
    showMoreUrl: section.showMoreUrl,
    position: null,
    showDivider: !!section.showDivider,
    type: SectionType.NONE,
    pageSection: null,
  }
}

export const prepareProductSectionInfo = (sectionProduct: SectionProduct): IProductSectionInfo => {
  const dealInfo: IProductSectionInfo = {
    id: sectionProduct.id,
    position: sectionProduct.position,
    isActive: sectionProduct.isActive,
    productInfo: prepareProductInfo({
      individualProduct: sectionProduct.individualProduct,
      comboProduct: sectionProduct.comboProduct,
    }),
  }

  return dealInfo
}

export const prepareCatalogueSectionInfo = (sectionCatalogue: SectionCatalogue): ICatalogueSectionInfo => {
  return {
    id: sectionCatalogue.id,
    position: sectionCatalogue.position,
    isActive: sectionCatalogue.isActive,
    catalogueInfo: prepareCatalogueInfo(sectionCatalogue.catalogue),
  }
}

export const prepareBlogSectionInfo = (sectionBlog: SectionBlog): IBlogSectionInfo => {
  return {
    id: sectionBlog.id,
    position: sectionBlog.position,
    isActive: sectionBlog.isActive,
    blogInfo: prepareBlogInfo(sectionBlog.blog),
  }
}

export const prepareSlideInfo = (slide: SectionSlide): ISlideInfo => {
  return {
    id: slide.id,
    url: slide.url,
    image: prepareImageInfo(slide.image),
    mobileImage: slide.mobileImage ? prepareImageInfo(slide.mobileImage) : null,
    position: slide.position,
    isActive: slide.isActive,
  }
}

export const prepareCustomerFeedbackInfo = (feedback: SectionCustomerFeedback): ICustomerFeedbackInfo => {
  return {
    id: feedback.id,
    name: feedback.customerName,
    email: feedback.customerEmail,
    designation: feedback.customerDesignation,
    image: prepareImageInfo(feedback.image),
    feedback: feedback.feedback,
    position: feedback.position,
    isActive: feedback.isActive,
  }
}

export const prepareProcedureInfo = (procedure: SectionProcedure): IProcedureInfo => {
  return {
    id: procedure.id,
    title: procedure.title,
    subTitle: procedure.subTitle,
    image: procedure.image ? prepareImageInfo(procedure.image) : null,
    position: procedure.position,
    isActive: procedure.isActive,
  }
}

export const prepareUSPInfo = (usp: SectionUSP): IUSPInfo => {
  return {
    id: usp.id,
    name: usp.name,
    url: usp.url,
    image: prepareImageInfo(usp.image),
    position: usp.position,
    isActive: usp.isActive,
  }
}

export const prepareCustomSectionBody = (customSection: SectionCustom): ICustomSectionBody => {
  return {
    id: customSection.id,
    html: customSection.customHTML,
    position: customSection.position,
    isActive: customSection.isActive,
  }
}
