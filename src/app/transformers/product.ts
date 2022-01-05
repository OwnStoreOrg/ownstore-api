import IndividualProduct from '../models/IndividualProductModel'
import {
  IIndividualProductInfo,
  IProductSKUInfo,
  IIndividualProductDetail,
  IProductAttributeInfo,
  IComboProductInfo,
  IComboProductDetail,
  IProductTagInfo,
  IProductFeatureSectionInfo,
  IProductInfo,
  IProductBrandInfo,
  IProductAttributeKeyInfo,
} from '../contract/product'
import { prepareCatalogueInfo, prepareCatalogueMeta } from './catalogue'
import ProductSKU from '../models/ProductSKUModel'
import ProductAttribute from '../models/ProductAttributeModel'
import { prepareSEOKeywords, generateSlug } from '../utils/common'
import { prepareCurrencyInfo } from './currency'
import ComboProduct from '../models/ComboProductModel'
import ProductTag from '../models/ProductTagModel'
import ProductFeatureSection from '../models/ProductFeatureSectionModel'
import { ProductType } from '../contract/constants'
import ProductBrand from '../models/ProductBrandModel'
import ProductAttributeKey from '../models/ProductAttributeKeyModel'
import { prepareImageInfo } from './image'

export const prepareProductBrandInfo = (brandInfo: ProductBrand): IProductBrandInfo => {
  return {
    id: brandInfo.id,
    slug: generateSlug(brandInfo.name),
    name: brandInfo.name,
    description: brandInfo.description,
    createdDateTime: new Date(brandInfo.createdAt),
  }
}

export const prepareProductSKUInfo = (productSKU: ProductSKU): IProductSKUInfo => {
  if (!productSKU) {
    // @ts-ignore
    return {}
  }
  return {
    id: productSKU.id,
    name: productSKU.name,
    retailPrice: productSKU.retailPrice,
    salePrice: productSKU.salePrice,
    onSale: productSKU.onSale,
    currency: prepareCurrencyInfo(productSKU.currency),
    saleDiscountPercentage: productSKU.saleDiscountPercentage,
    saleDiscountFlat: productSKU.saleDiscountFlat,
    availableQuantity: productSKU.availableQuantity,
    comingSoon: productSKU.comingSoon,
    createdDateTime: new Date(productSKU.createdAt),
  }
}

export const prepareProductAttributeKeyInfo = (productAttributeKey: ProductAttributeKey): IProductAttributeKeyInfo => {
  return {
    id: productAttributeKey.id,
    name: productAttributeKey.name,
  }
}

export const prepareProductAttributeInfo = (productAttribute: ProductAttribute): IProductAttributeInfo => {
  return {
    id: productAttribute.id,
    key: productAttribute.attributeKey ? prepareProductAttributeKeyInfo(productAttribute.attributeKey) : null,
    value: productAttribute.attributeValue,
    position: productAttribute.position,
    isActive: productAttribute.isActive,
  }
}

export const prepareProductTagInfo = (productTag: ProductTag): IProductTagInfo => {
  return {
    id: productTag.id,
    iconType: productTag.iconType,
    label: productTag.label,
    position: productTag.position,
    isActive: productTag.isActive,
  }
}

export const prepareProductFeatureSection = (
  productFeatureSection: ProductFeatureSection
): IProductFeatureSectionInfo => {
  return {
    id: productFeatureSection.id,
    title: productFeatureSection.title,
    body: productFeatureSection.body,
    position: productFeatureSection.position,
    isActive: productFeatureSection.isActive,
  }
}

export const prepareProductInfo = ({
  individualProduct,
  comboProduct,
}: {
  individualProduct: IndividualProduct | null
  comboProduct: ComboProduct | null
}): IProductInfo => {
  let productInfo: IProductInfo = {
    type: ProductType.NONE,
  }

  if (individualProduct) {
    productInfo = prepareIndividualProductInfo(individualProduct)
  }

  if (comboProduct) {
    productInfo = prepareComboProductInfo(comboProduct)
  }

  return productInfo
}

export const prepareIndividualProductInfo = (individualProduct: IndividualProduct): IIndividualProductInfo => {
  return {
    type: ProductType.INDIVIDUAL,
    id: individualProduct.id,
    name: individualProduct.name,
    shortName: individualProduct.shortName,
    slug: generateSlug(individualProduct.name),
    position: individualProduct.position,
    isActive: individualProduct.isActive,
    catalogue: prepareCatalogueMeta(individualProduct.catalogue),
    sku: prepareProductSKUInfo(individualProduct.sku),
    images: individualProduct.images ? individualProduct.images.map(prepareImageInfo) : [],
  }
}

export const prepareIndividualProductDetail = (individualProduct: IndividualProduct): IIndividualProductDetail => {
  const individualProductInfo = prepareIndividualProductInfo(individualProduct)
  return {
    ...individualProductInfo,
    description: individualProduct.description,
    seo: {
      title: individualProduct.seoTitle || null,
      description: individualProduct.seoDescription || null,
      keywords: prepareSEOKeywords(individualProduct.seoKeywords),
    },
    createdDateTime: new Date(individualProduct.createdAt),
    updatedDateTime: new Date(individualProduct.updatedAt),
    catalogue: prepareCatalogueInfo(individualProduct.catalogue),
    attributes: individualProduct.attributes.map(prepareProductAttributeInfo).sort((a, b) => a.position - b.position),
    tags: individualProduct.tags.map(prepareProductTagInfo).sort((a, b) => a.position - b.position),
    productsRelation: null, // populated at service level
    featureSections: individualProduct.featureSections
      .map(prepareProductFeatureSection)
      .sort((a, b) => a.position - b.position),
    brand: individualProduct.brand ? prepareProductBrandInfo(individualProduct.brand) : null,
  }
}

export const prepareComboProductInfo = (comboProduct: ComboProduct): IComboProductInfo => {
  return {
    type: ProductType.COMBO,
    id: comboProduct.id,
    name: comboProduct.name,
    shortName: comboProduct.shortName,
    slug: generateSlug(comboProduct.name),
    position: comboProduct.position,
    isActive: comboProduct.isActive,
    sku: prepareProductSKUInfo(comboProduct.sku),
    images: comboProduct.images ? comboProduct.images.map(prepareImageInfo) : [],
  }
}

export const prepareComboProductDetail = (comboProduct: ComboProduct): IComboProductDetail => {
  const comboProductInfo = prepareComboProductInfo(comboProduct)
  return {
    ...comboProductInfo,
    description: comboProduct.description,
    seo: {
      title: comboProduct.seoTitle || null,
      description: comboProduct.seoDescription || null,
      keywords: prepareSEOKeywords(comboProduct.seoKeywords),
    },
    createdDateTime: new Date(comboProduct.createdAt),
    updatedDateTime: new Date(comboProduct.updatedAt),
    attributes: comboProduct.attributes.map(prepareProductAttributeInfo).sort((a, b) => a.position - b.position),
    products: comboProduct.individualComboProducts
      .map(comboProduct => prepareIndividualProductInfo(comboProduct.individualProduct))
      .sort((a, b) => a.position - b.position),
    tags: comboProduct.tags.map(prepareProductTagInfo),
    productsRelation: null, // populated at service level
    featureSections: comboProduct.featureSections
      .map(prepareProductFeatureSection)
      .sort((a, b) => a.position - b.position),
  }
}
