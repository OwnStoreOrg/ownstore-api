import { ProductType, SectionType } from '../../contract/constants'

export interface ISectionInfoUpdateCommand {
  id: number | null
  name: string
  title: string | null
  subTitle: string | null
  showMoreUrl: string | null
  showDivider: boolean | null
  type: SectionType
}

export interface IProductSectionInfoUpdateCommand {
  id: number | null
  sectionId: number
  position: number
  isActive: boolean
  productType: ProductType
  productId: number
}

export interface ICatalogueSectionInfoUpdateCommand {
  id: number | null
  sectionId: number
  position: number
  isActive: boolean
  catalogueId: number
}

export interface IBlogSectionInfoUpdateCommand {
  id: number | null
  sectionId: number
  position: number
  isActive: boolean
  blogId: number
}

export interface ISlideInfoUpdateCommand {
  id: number | null
  sectionId: number
  url: string | null
  imageId: number
  mobileImageId: number | null
  position: number
  isActive: boolean
}

export interface IUSPInfoUpdateCommand {
  id: number | null
  sectionId: number
  name: string
  url: string | null
  imageId: number
  position: number
  isActive: boolean
}

export interface IProcedureInfoUpdateCommand {
  id: number | null
  sectionId: number
  title: string
  subTitle: string
  imageId: number | null
  position: number
  isActive: boolean
}

export interface ICustomerFeedbackInfoUpdateCommand {
  id: number | null
  sectionId: number
  name: string
  email: string | null
  designation: string | null
  feedback: string
  imageId: number
  position: number
  isActive: boolean
}

export interface ICustomSectionBodyUpdateCommand {
  id: number | null
  sectionId: number
  html: string
  position: number
  isActive: boolean
}

export interface IPageSectionInfoUpdateCommand {
  id: number | null
  sectionId: number
  position: number
  title: string | null
  subTitle: string | null
  showMoreUrl: string | null
  showDivider: boolean | null
}
