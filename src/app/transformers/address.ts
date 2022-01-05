import { IUserAddressInfo } from '../contract/address'
import UserAddress from '../models/UserAddressModel'

export const prepareUserAddressInfo = (userAddress: UserAddress): IUserAddressInfo => {
  return {
    id: userAddress.id,
    name: userAddress.name,
    phoneNumber: userAddress.phoneNumber,
    addressLine: userAddress.addressLine,
    area: userAddress.area,
    areaCode: userAddress.areaCode,
    city: userAddress.city,
    country: userAddress.country,
    isPrimary: userAddress.isPrimary,
    isActive: userAddress.isActive,
    addressType: userAddress.addressType,
  }
}
