import { IComboProductInfo, IIndividualProductInfo, IProductInfo } from '../contract/product'

export const shouldDisableProduct = (productInfo: IProductInfo) => {
  const product = productInfo as IIndividualProductInfo | IComboProductInfo
  return !product.isActive || product.sku.availableQuantity < 1 || product.sku.comingSoon
}
