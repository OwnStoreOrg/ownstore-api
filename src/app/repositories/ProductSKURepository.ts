import { EntityRepository, FindConditions, Repository } from 'typeorm'
import { ProductType } from '../contract/constants'
import ProductSKU from '../models/ProductSKUModel'
import { IProductSKUInfoUpdateCommand } from './commands/product'

@EntityRepository(ProductSKU)
export default class ProductSKURepository extends Repository<ProductSKU> {
  public async updateProductSKU(
    productId: number,
    productType: ProductType,
    command: IProductSKUInfoUpdateCommand
  ): Promise<void> {
    await this.save({
      // @ts-ignore
      id: command.id,
      individualProduct: productType === ProductType.INDIVIDUAL ? productId : null,
      comboProduct: productType === ProductType.COMBO ? productId : null,
      name: command.name,
      retailPrice: command.retailPrice,
      salePrice: command.salePrice,
      onSale: command.onSale,
      currency: command.currencyId as any,
      saleDiscountPercentage: command.saleDiscountPercentage,
      saleDiscountFlat: command.saleDiscountFlat,
      availableQuantity: command.availableQuantity,
      comingSoon: command.comingSoon,
      ...(!command.id && { createdAt: new Date() }),
      // @ts-ignore
      updatedAt: new Date(),
    })
  }
}
