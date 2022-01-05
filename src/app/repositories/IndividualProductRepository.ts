import { EntityRepository, Repository, FindManyOptions, ILike, In, getCustomRepository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import IndividualProductModel from '../models/IndividualProductModel'
import { flattenList, uniqueList } from '../utils/common'
import CatalogueRepository from './CatalogueRepository'
import { IFindCommand } from './commands/common'
import { IIndividualProductDetailUpdateCommand } from './commands/product'
import ImageRepository from './ImageRepository'

@EntityRepository(IndividualProductModel)
export default class IndividualProductRepository extends Repository<IndividualProductModel> {
  private catalogueRepository = getCustomRepository(CatalogueRepository)

  private imageRepository = getCustomRepository(ImageRepository)

  public async getBulkInfo(ids: number[], findCommand: IFindCommand): Promise<Record<number, IndividualProductModel>> {
    const result: Record<number, IndividualProductModel> = {}

    const _findOptions: FindManyOptions = {
      relations: ['catalogue', 'sku', 'sku.currency'],
      skip: findCommand.offset,
      take: findCommand.limit,
      order: {
        position: 'ASC',
      },
    }

    const individualProducts = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    // Faiyaz: Product info contract doesn't require catalogue images, hence comming this.
    // const catalogueIds: number[] = []
    // individualProducts.forEach(product => {
    //   catalogueIds.push(product.catalogue.id)
    // })
    // const catalogues = await this.catalogueRepository.getBulk(uniqueList(catalogueIds), {})

    individualProducts.forEach(product => {
      result[product.id] = {
        ...product,
        // catalogue: catalogues[product.catalogue.id],
      }
    })

    const productImagesMap: Record<number, number[]> = {}
    individualProducts.forEach(product => {
      if (product.imageIds) {
        const imagesList = product.imageIds.split(',').map(i => Number(i.trim()))
        productImagesMap[product.id] = imagesList
      }
    })

    const imageIds = uniqueList(flattenList(Object.values(productImagesMap)))
    const images = imageIds.length > 0 ? await this.imageRepository.getBulk(imageIds) : {}

    for (const [productId, productImages] of Object.entries(productImagesMap)) {
      result[productId].images = productImages.filter(Boolean).map(imageId => images[imageId])
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

  public async getBulkIdsByCatalogueIds(
    catalogueId: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, number[]>> {
    const _findOptions: FindManyOptions<IndividualProductModel> = {
      relations: ['catalogue'],
      select: ['id', 'catalogue'],
      where: {
        catalogue: {
          id: In([...catalogueId]),
        },
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const result: Record<number, number[]> = {}

    const individualProducts = await this.find(_findOptions)

    individualProducts.forEach(individualProduct => {
      const products = result[individualProduct.catalogue.id] || []
      products.push(individualProduct.id)
      result[individualProduct.catalogue.id] = products
    })

    return result
  }

  public async getBulkIdsByName(name: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<IndividualProductModel> = {
      relations: [],
      select: ['id'],
      where: {
        name: ILike(`%${name}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const individualProducts = await this.find(_findOptions)

    individualProducts.forEach(order => {
      result.push(order.id)
    })

    return result
  }

  public async getBulkDetail(
    ids: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, IndividualProductModel>> {
    const result: Record<number, IndividualProductModel> = {}

    const _findOptions: FindManyOptions = {
      relations: [
        'catalogue',
        'sku',
        'sku.currency',
        'attributes',
        'attributes.attributeKey',
        'tags',
        'featureSections',
        'brand',
        'productsRelation',
      ],
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const individualProducts = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    const catalogueIds: number[] = []
    individualProducts.forEach(product => {
      catalogueIds.push(product.catalogue.id)
    })
    const catalogues = await this.catalogueRepository.getBulk(uniqueList(catalogueIds), {})

    individualProducts.forEach(product => {
      result[product.id] = {
        ...product,
        catalogue: catalogues[product.catalogue.id],
      }
    })

    const productImagesMap: Record<number, number[]> = {}
    individualProducts.forEach(product => {
      if (product.imageIds) {
        const imagesList = product.imageIds.split(',').map(i => Number(i.trim()))
        productImagesMap[product.id] = imagesList
      }
    })

    const imageIds = uniqueList(flattenList(Object.values(productImagesMap)))
    const images = imageIds.length > 0 ? await this.imageRepository.getBulk(imageIds) : {}

    for (const [productId, productImages] of Object.entries(productImagesMap)) {
      result[productId].images = productImages.filter(Boolean).map(imageId => images[imageId])
    }

    return result
  }

  public async addIndividualProduct(command: IIndividualProductDetailUpdateCommand): Promise<void> {
    await this.save({
      name: command.basic?.name,
      shortName: command.basic?.shortName,
      position: command.basic?.position,
      isActive: command.basic?.isActive,
      description: command.basic?.description,
      seoTitle: command.basic?.seo.title,
      seoDescription: command.basic?.seo.description,
      seoKeywords: (command.basic?.seo.keywords || []).join(','),
      catalogue: command.basic?.catalogueId as any,
      imageIds: command.basic?.imageIds,
      brand: command.brandId as any,
      productsRelation: command.productsRelationId as any,
    })
  }

  public async updateIndividualProduct(command: IIndividualProductDetailUpdateCommand): Promise<void> {
    let updateParams: QueryDeepPartialEntity<IndividualProductModel> = {
      brand: command.brandId as any,
      productsRelation: command.productsRelationId as any,
      updatedAt: new Date(),
    }

    if (command.basic) {
      updateParams = {
        ...updateParams,
        name: command.basic.name,
        shortName: command.basic.shortName,
        position: command.basic.position,
        isActive: command.basic.isActive,
        description: command.basic.description,
        seoTitle: command.basic.seo.title,
        seoDescription: command.basic.seo.description,
        seoKeywords: (command.basic.seo.keywords || []).join(','),
        catalogue: command.basic.catalogueId as any,
        imageIds: command.basic.imageIds,
      }
    }

    if (command.brandId) {
      updateParams = {
        ...updateParams,
        brand: command.brandId as any,
      }
    }

    if (command.productsRelationId) {
      updateParams = {
        ...updateParams,
        productsRelation: command.productsRelationId as any,
      }
    }

    await this.update(
      {
        id: command.id as number,
      },
      updateParams
    )
  }
}
