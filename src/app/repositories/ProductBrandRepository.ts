import { EntityRepository, FindConditions, FindManyOptions, Repository } from 'typeorm'
import ProductBrand from '../models/ProductBrandModel'
import { IFindCommand } from './commands/common'
import { IProductBrandInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductBrand)
export default class ProductBrandRepository extends Repository<ProductBrand> {
  public async getBulk(ids: number[]): Promise<Record<number, ProductBrand>> {
    const result: Record<number, ProductBrand> = {}

    const _findOptions: FindManyOptions<ProductBrand> = {
      relations: [],
    }

    const brands = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    brands.forEach(brand => {
      result[brand.id] = brand
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

    const brands = await this.find(_findOptions)
    return brands.map(brand => brand.id)
  }

  public async saveBrand(command: IProductBrandInfoUpdateCommand): Promise<ProductBrand> {
    const newBrand = await this.save({
      id: command.id as any,
      name: command.name,
      description: command.description,
      ...(!command.id && { createdAt: new Date() }),
      updatedAt: new Date(),
    })
    return newBrand
  }

  public async deleteBrand(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
