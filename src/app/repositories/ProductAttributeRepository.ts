import { EntityRepository, In, Repository } from 'typeorm'
import { ProductType } from '../contract/constants'
import ProductAttribute from '../models/ProductAttributeModel'
import { IProductAttributeInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductAttribute)
export default class ProductAttributeRepository extends Repository<ProductAttribute> {
  public async updateProductAttribute(
    productId: number,
    productType: ProductType,
    command: IProductAttributeInfoUpdateCommand[]
  ): Promise<void> {
    await this.save(
      command.map(com => ({
        id: com.id as any,
        attributeKey: com.keyId as any,
        attributeValue: com.value,
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
