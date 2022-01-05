import { EntityRepository, FindConditions, FindManyOptions, Repository } from 'typeorm'
import ProductsRelation from '../models/ProductsRelationModel'
import { IFindCommand } from './commands/common'
import { IProductBrandInfoUpdateCommand, IProductsRelationInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductsRelation)
export default class ProductBrandRepository extends Repository<ProductsRelation> {
  public async getBulk(ids: number[]): Promise<Record<number, ProductsRelation>> {
    const result: Record<number, ProductsRelation> = {}

    const _findOptions: FindManyOptions<ProductsRelation> = {
      relations: [],
    }

    const relations = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    relations.forEach(relation => {
      result[relation.id] = relation
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

    const relations = await this.find(_findOptions)
    return relations.map(relation => relation.id)
  }

  public async saveProductsRelation(command: IProductsRelationInfoUpdateCommand): Promise<ProductsRelation> {
    const newBrand = await this.save({
      id: command.id as any,
      name: command.name,
      description: command.description,
      relatedProductIds: command.productIds,
      ...(!command.id && { createdAt: new Date() }),
      updatedAt: new Date(),
    })
    return newBrand
  }

  public async deleteProductsRelation(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
