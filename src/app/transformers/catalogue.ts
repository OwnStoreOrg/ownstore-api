import Catalogue from '../models/CatalogueModel'
import { ICatalogueInfo, ICatalogueMeta } from '../contract/catalogue'
import { generateSlug } from '../utils/common'
import { prepareImageInfo } from './image'

export const prepareCatalogueMeta = (catalogue: Catalogue): ICatalogueMeta => {
  return {
    id: catalogue.id,
    name: catalogue.name,
    slug: generateSlug(catalogue.name),
    position: catalogue.position,
    isActive: catalogue.isActive,
  }
}

export const prepareCatalogueInfo = (catalogue: Catalogue): ICatalogueInfo => {
  return {
    ...prepareCatalogueMeta(catalogue),
    images: catalogue.images ? catalogue.images.map(prepareImageInfo) : [],
  }
}
