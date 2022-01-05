import { prepareProductInfo } from './product'
import UserWish from '../models/UserWish'
import { IUserWishInfo } from '../contract/userWish'

export const prepareUserWishInfo = (userWish: UserWish): IUserWishInfo => {
  return {
    id: userWish.id,
    createdDateTime: new Date(userWish.createdAt),
    product: prepareProductInfo({
      individualProduct: userWish.individualProduct,
      comboProduct: userWish.comboProduct,
    }),
  }
}
