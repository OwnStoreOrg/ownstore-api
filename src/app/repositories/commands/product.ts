import { ProductTagIconType } from '../../contract/constants'

export interface IProductSKUInfoUpdateCommand {
  id: number | null
  name: string
  retailPrice: number
  salePrice: number
  onSale: boolean
  currencyId: number
  saleDiscountPercentage: number | null
  saleDiscountFlat: number | null
  availableQuantity: number
  comingSoon: boolean
}

export interface IProductTagInfoUpdateCommand {
  id: number | null
  iconType: ProductTagIconType
  label: string
  position: number
  isActive: boolean
}

export interface IProductAttributeInfoUpdateCommand {
  id: number | null
  keyId: number | null
  value: string
  position: number
  isActive: boolean
}

export interface IProductFeatureSectionInfoUpdateCommand {
  id: number | null
  title: string
  body: string
  position: number
  isActive: boolean
}

export interface IProductBrandInfoUpdateCommand {
  id: number | null
  name: string
  description: string | null
}

export interface IProductAttributeKeyInfoUpdateCommand {
  id: number | null
  name: string
}

export interface IProductsRelationInfoUpdateCommand {
  id: number | null
  name: string
  description: string | null
  productIds: string
}

export interface IIndividualProductDetailUpdateCommand {
  id: number | null
  basic: {
    name: string
    shortName: string | null
    position: number
    isActive: boolean
    description: string
    seo: {
      title: string | null
      description: string | null
      keywords: string[]
    }
    catalogueId: number
    imageIds: string
  } | null
  brandId: number | null
  productsRelationId: number | null
  sku: IProductSKUInfoUpdateCommand | null
  tags: IProductTagInfoUpdateCommand[] | null
  attributes: IProductAttributeInfoUpdateCommand[] | null
  featureSections: IProductFeatureSectionInfoUpdateCommand[] | null
}

export interface IComboProductDetailUpdateCommand {
  id: number | null
  basic: {
    name: string
    shortName: string | null
    position: number
    isActive: boolean
    description: string
    seo: {
      title: string | null
      description: string | null
      keywords: string[]
    }
    imageIds: string
  } | null
  productsRelationId: number | null
  sku: IProductSKUInfoUpdateCommand | null
  tags: IProductTagInfoUpdateCommand[] | null
  attributes: IProductAttributeInfoUpdateCommand[] | null
  featureSections: IProductFeatureSectionInfoUpdateCommand[] | null
}
