import { EntityRepository, Repository, FindManyOptions, In, getCustomRepository } from 'typeorm'
import { IFindCommand } from './commands/common'
import { IProductSectionInfoUpdateCommand } from './commands/section'
import { ProductType } from '../contract/constants'
import IndividualProductRepository from './IndividualProductRepository'
import ComboRepository from './ComboProductRepository'
import { uniqueList } from '../utils/common'
import SectionProduct from '../models/SectionProductModel'

@EntityRepository(SectionProduct)
export default class SectionProductRepository extends Repository<SectionProduct> {
  private individualProductRepository = getCustomRepository(IndividualProductRepository)

  private comboProductRepository = getCustomRepository(ComboRepository)

  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionProduct[]>> {
    const result: Record<number, SectionProduct[]> = {}

    const _findOptions: FindManyOptions<SectionProduct> = {
      relations: ['individualProduct', 'individualProduct.catalogue', 'comboProduct', 'section'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const sectionSectionProducts = await this.find(_findOptions)

    const individualProductIds: number[] = []
    const comboProductIds: number[] = []

    sectionSectionProducts.forEach(product => {
      if (product.individualProduct) {
        individualProductIds.push(product.individualProduct.id)
      }
      if (product.comboProduct) {
        comboProductIds.push(product.comboProduct.id)
      }
    })

    const [individualProducts, comboProducts] = await Promise.all([
      this.individualProductRepository.getBulkInfo(uniqueList(individualProductIds), {}),
      this.comboProductRepository.getBulkInfo(uniqueList(comboProductIds), {}),
    ])

    sectionSectionProducts.forEach(sectionDeal => {
      const sectionProducts = result[sectionDeal.section.id] || []
      sectionProducts.push({
        ...sectionDeal,
        individualProduct: sectionDeal.individualProduct ? individualProducts[sectionDeal.individualProduct.id] : null,
        comboProduct: sectionDeal.comboProduct ? comboProducts[sectionDeal.comboProduct.id] : null,
      })
      result[sectionDeal.section.id] = sectionProducts
    })

    return result
  }

  public async addProductSection(command: IProductSectionInfoUpdateCommand): Promise<SectionProduct> {
    const newDeal = await this.save({
      position: command.position,
      isActive: command.isActive,
      productType: command.productType,
      ...(command.productType === ProductType.COMBO
        ? { comboProduct: command.productId as any }
        : { individualProduct: command.productId as any }),
      section: command.sectionId as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateProductSection(command: IProductSectionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        position: command.position,
        isActive: command.isActive,
        productType: command.productType,
        ...(command.productType === ProductType.COMBO
          ? { comboProduct: command.productId as any }
          : { individualProduct: command.productId as any }),
        section: command.sectionId as any,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteProductSection(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
