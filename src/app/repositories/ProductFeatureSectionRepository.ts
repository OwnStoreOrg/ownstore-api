import { EntityRepository, FindConditions, In, Repository } from 'typeorm'
import { ProductType } from '../contract/constants'
import ProductFeatureSection from '../models/ProductFeatureSectionModel'
import { IProductFeatureSectionInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductFeatureSection)
export default class ProductFeatureSectionRepository extends Repository<ProductFeatureSection> {
  public async updateProductFeatureSection(
    productId: number,
    productType: ProductType,
    command: IProductFeatureSectionInfoUpdateCommand[]
  ): Promise<void> {
    await this.save(
      command.map(com => ({
        id: com.id as any,
        title: com.title,
        body: com.body,
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
