import { EntityRepository, FindManyOptions, Repository } from 'typeorm'
import ProductAttributeKey from '../models/ProductAttributeKeyModel'
import { IFindCommand } from './commands/common'
import { IProductAttributeKeyInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductAttributeKey)
export default class ProductAttributeKeyRepository extends Repository<ProductAttributeKey> {
  public async getBulk(ids: number[]): Promise<Record<number, ProductAttributeKey>> {
    const result: Record<number, ProductAttributeKey> = {}

    const _findOptions: FindManyOptions<ProductAttributeKey> = {
      relations: [],
    }

    const keys = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    keys.forEach(key => {
      result[key.id] = key
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

    const keys = await this.find(_findOptions)
    return keys.map(key => key.id)
  }

  public async saveAttributeKey(command: IProductAttributeKeyInfoUpdateCommand): Promise<ProductAttributeKey> {
    const newBrand = await this.save({
      id: command.id as any,
      name: command.name,
      ...(!command.id && { createdAt: new Date() }),
      updatedAt: new Date(),
    })
    return newBrand
  }

  public async deleteAttributeKey(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
