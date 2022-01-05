import { SERVICE_CACHE_TTL } from '../constants'
import { IFindParams } from '../contract/common'
import { IImageInfo, IImageInfoUpdate, IImageInfoUpdateParams } from '../contract/image'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { EntityNotFoundError } from '../errors/EntityError'
import { prepareImageInfo } from '../transformers/image'
import BaseService from './BaseService'
import { IImageService } from './interface'

export default class ImageService extends BaseService implements IImageService {
  @CacheBulkBuild('CR', [[0]], SERVICE_CACHE_TTL.LONG, 'IMIS')
  private async _prepareImageState(imageIds: number[]): Promise<Record<number, IImageInfo>> {
    const result: Record<number, IImageInfo> = {}

    const imageMap = await this.getImageRepository().getBulk(imageIds)

    Object.entries(imageMap).forEach(([imageId, image]) => {
      result[imageId] = prepareImageInfo(image)
    })

    return result
  }

  @CacheBuild(
    'CR',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.LONG,
    'IMIL'
  )
  public async getAllImageInfos(findParams: IFindParams): Promise<IImageInfo[]> {
    const imageIds = await this.getImageRepository().getBulkIds(findParams)
    const imageInfos = await this._prepareImageState(imageIds)
    return Object.values(imageInfos)
  }

  public async getImageInfo(imageId: number): Promise<IImageInfo> {
    const images = await this._prepareImageState([imageId])
    const imageInfo = images[imageId]

    if (!imageInfo) {
      throw new EntityNotFoundError('image', imageId)
    }

    return imageInfo
  }

  public async getImageInfoByIds(imageIds: number[]): Promise<Record<number, IImageInfo>> {
    const images = await this._prepareImageState(imageIds)
    return images
  }

  @CacheBuild('CS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'IMIQ')
  public async getAllImageInfosByQuery(query: string, findParams: IFindParams): Promise<IImageInfo[]> {
    const imageIds = await this.getImageRepository().getBulkIdsByName(query, findParams)

    if (!imageIds.length) {
      return []
    }

    const images = await this._prepareImageState(imageIds)
    return Object.values(images)
  }

  public async updateImageInfo(imageId: number | null, params: IImageInfoUpdateParams): Promise<IImageInfoUpdate> {
    const result: IImageInfoUpdate = {
      success: false,
      id: null,
    }

    result.id = await this.getImageRepository().updateImage({
      id: imageId,
      ...params,
    })

    result.success = true

    return result
  }
}
