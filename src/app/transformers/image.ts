import { IImageInfo } from '../contract/image'
import Image from '../models/ImageModel'

export const prepareImageInfo = (image: Image): IImageInfo => {
  return {
    id: image.id,
    url: image.url,
    name: image.name,
    createdAt: image.createdAt,
  }
}
