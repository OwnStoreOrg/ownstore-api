import { DeepPartial, EntityRepository, FindManyOptions, ILike, In, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import Image from '../models/ImageModel'
import { IFindCommand } from './commands/common'
import { IImageInfoUpdateCommand } from './commands/image'

@EntityRepository(Image)
export default class ImageRepository extends Repository<Image> {
  public async getBulk(imageIds: number[]): Promise<Record<number, Image>> {
    const result: Record<number, Image> = {}

    const _findOptions: FindManyOptions<Image> = {
      relations: [],
      where: {
        id: In([...imageIds]),
      },
    }

    const images = await this.find(_findOptions)

    images.forEach(image => {
      result[image.id] = image
    })

    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
      select: ['id'],
      order: {
        id: 'ASC',
      },
    }

    const images = await this.find(_findOptions)
    return images.map(image => image.id)
  }

  public async getBulkIdsByName(name: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<Image> = {
      relations: [],
      select: ['id'],
      where: {
        name: ILike(`%${name}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const images = await this.find(_findOptions)

    images.forEach(image => {
      result.push(image.id)
    })

    return result
  }

  public async updateImage(command: IImageInfoUpdateCommand): Promise<number> {
    let params: DeepPartial<Image> = {
      id: command.id as any,
      name: command.name || '',
      url: command.url,
      ...(!command.id && { createdAt: new Date() }),
    }

    if (command.meta) {
      params = {
        ...params,
        thirdPartyId: command.meta?.thirdPartyId || null,
        originalName: command.meta?.originalName || null,
        sizeInBytes: command.meta?.sizeInBytes || null,
        width: command.meta?.width || null,
        height: command.meta?.height || null,
      }
    }

    const { id } = await this.save(params)
    return id
  }
}
