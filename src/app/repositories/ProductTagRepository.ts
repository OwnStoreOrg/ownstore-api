import { EntityRepository, FindConditions, In, Repository } from 'typeorm'
import { ProductType } from '../contract/constants'
import ProductTag from '../models/ProductTagModel'
import { IProductTagInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductTag)
export default class ProductTagRepository extends Repository<ProductTag> {
  public async updateProductTag(
    productId: number,
    productType: ProductType,
    command: IProductTagInfoUpdateCommand[]
  ): Promise<void> {
    await this.save(
      command.map(com => ({
        id: com.id as any,
        label: com.label,
        iconType: com.iconType,
        position: com.position,
        isActive: com.isActive,
        individualProduct: (productType === ProductType.INDIVIDUAL ? productId : null) as any,
        comboProduct: (productType === ProductType.COMBO ? productId : null) as any,
        ...(!com.id && { createdAt: new Date() }),
        updatedAt: new Date(),
      }))
    )
  }

  public async deleteBulk(productId: number, productType: ProductType, ids: number[]): Promise<void> {
    await this.delete({
      id: In([...ids]),
      ...(productType === ProductType.COMBO
        ? { comboProduct: productId as any }
        : { individualProduct: productId as any }),
    })
  }
}
