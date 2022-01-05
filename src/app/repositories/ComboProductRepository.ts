import { EntityRepository, Repository, FindManyOptions, ILike, getCustomRepository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { IComboProductInfo } from '../contract/product'
import ComboProduct from '../models/ComboProductModel'
import { flattenList, uniqueList } from '../utils/common'
import { IFindCommand } from './commands/common'
import { IComboProductDetailUpdateCommand } from './commands/product'
import ImageRepository from './ImageRepository'
import IndividualProductRepository from './IndividualProductRepository'

@EntityRepository(ComboProduct)
export default class ComboRepository extends Repository<ComboProduct> {
  private individualProductRepository = getCustomRepository(IndividualProductRepository)

  private imageRepository = getCustomRepository(ImageRepository)

  public async getBulkInfo(ids: number[], findCommand: IFindCommand): Promise<Record<number, ComboProduct>> {
    const result: Record<number, ComboProduct> = {}

    const _findOptions: FindManyOptions = {
      relations: ['sku', 'sku.currency'],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const combos = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    combos.forEach(combo => {
      result[combo.id] = combo
    })

    const productImagesMap: Record<number, number[]> = {}
    combos.forEach(product => {
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

  public async getBulkIdsByName(name: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<ComboProduct> = {
      relations: [],
      select: ['id'],
      where: {
        name: ILike(`%${name}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const comboProducts = await this.find(_findOptions)

    comboProducts.forEach(order => {
      result.push(order.id)
    })

    return result
  }

  public async getBulkDetail(ids: number[], findCommand: IFindCommand): Promise<Record<number, ComboProduct>> {
    const result: Record<number, ComboProduct> = {}

    const findParams: FindManyOptions = {
      relations: [
        'sku',
        'sku.currency',
        'attributes',
        'attributes.attributeKey',
        'individualComboProducts',
        'individualComboProducts.individualProduct',
        'tags',
        'featureSections',
        'productsRelation',
      ],
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const combos = await (ids.length === 0 ? this.find(findParams) : this.findByIds(ids, findParams))

    const individualProductIds: number[] = []

    combos.forEach(wish => {
      if (wish.individualComboProducts.length) {
        wish.individualComboProducts.forEach(iProduct => {
          individualProductIds.push(iProduct.id)
        })
      }
    })

    const uniqueIndividualProductIds = uniqueList(individualProductIds)
    const individualProducts =
      uniqueIndividualProductIds.length > 0
        ? await this.individualProductRepository.getBulkInfo(uniqueIndividualProductIds, {})
        : {}

    combos.forEach(combo => {
      result[combo.id] = {
        ...combo,
        individualComboProducts: combo.individualComboProducts.map(iProduct => {
          return {
            ...iProduct,
            individualProduct: individualProducts[iProduct.individualProduct.id],
          }
        }),
      }
    })

    const productImagesMap: Record<number, number[]> = {}
    combos.forEach(product => {
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

  public async addComboProduct(command: IComboProductDetailUpdateCommand): Promise<void> {
    await this.save({
      name: command.basic?.name,
      shortName: command.basic?.shortName,
      position: command.basic?.position,
      isActive: command.basic?.isActive,
      description: command.basic?.description,
      imageIds: command.basic?.imageIds,
      seoTitle: command.basic?.seo.title,
      seoDescription: command.basic?.seo.description,
      seoKeywords: (command.basic?.seo.keywords || []).join(','),
      productsRelation: command.productsRelationId as any,
    })
  }

  public async updateComboProduct(command: IComboProductDetailUpdateCommand): Promise<void> {
    let updateParams: QueryDeepPartialEntity<ComboProduct> = {
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
        imageIds: command.basic.imageIds,
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
