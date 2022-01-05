import { EntityRepository, Repository, FindManyOptions, ILike, getCustomRepository } from 'typeorm'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'
import Catalogue from '../models/CatalogueModel'
import Image from '../models/ImageModel'
import { IImageService } from '../services/interface'
import { ICatalogueInfoUpdateCommand } from './commands/catalogue'
import { IFindCommand } from './commands/common'
import ImageRepository from '../repositories/ImageRepository'
import { flattenList, uniqueList } from '../utils/common'

@EntityRepository(Catalogue)
export default class CatalogueRepository extends Repository<Catalogue> {
  private imageRepository = getCustomRepository(ImageRepository)

  public async getBulk(ids: number[], findCommand: IFindCommand): Promise<Record<number, Catalogue>> {
    const result: Record<number, Catalogue> = {}

    const _findOptions: FindManyOptions<Catalogue> = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const catalogues = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    const catalogueImagesMap: Record<number, number[]> = {}

    catalogues.forEach(catalogue => {
      if (catalogue.imageIds) {
        const imagesList = catalogue.imageIds.split(',').map(i => Number(i.trim()))
        catalogueImagesMap[catalogue.id] = imagesList
      }
    })

    const imageIds = uniqueList(flattenList(Object.values(catalogueImagesMap)))
    const images = imageIds.length > 0 ? await this.imageRepository.getBulk(imageIds) : {}

    catalogues.forEach(catalogue => {
      result[catalogue.id] = catalogue
    })

    for (const [catalogueId, catalogueImages] of Object.entries(catalogueImagesMap)) {
      result[catalogueId].images = catalogueImages.filter(Boolean).map(imageId => images[imageId])
    }

    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
      select: ['id'],
      order: {
        position: 'ASC',
      },
    }

    const individualProducts = await this.find(_findOptions)
    return individualProducts.map(product => product.id)
  }

  public async getBulkIdsByName(name: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<Catalogue> = {
      relations: [],
      select: ['id'],
      where: {
        name: ILike(`%${name}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const catalogues = await this.find(_findOptions)

    catalogues.forEach(catalogue => {
      result.push(catalogue.id)
    })

    return result
  }

  public async addCatalogue(command: ICatalogueInfoUpdateCommand): Promise<Catalogue> {
    const newCurrency = await this.save({
      name: command.name,
      imageIds: command.imageIds,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newCurrency
  }

  public async updateCatalogue(command: ICatalogueInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        name: command.name,
        imageIds: command.imageIds,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteCatalogue(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
