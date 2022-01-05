import User from '../models/UserModel'
import { IUserInfo, IUserDetail, IUserLoginAttributesInfo } from '../contract/user'
import UserLoginHistory from '../models/UserLoginHistoryModel'
import { prepareUserAddressInfo } from './address'

export const prepareUserInfo = (user: User): IUserInfo => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    joinedDateTime: new Date(user.joinedAt),
    isActive: user.isActive,
  }
}

export const prepareUserDetail = (user: User): IUserDetail => {
  const userInfo = prepareUserInfo(user)
  return {
    ...userInfo,
    addresses: user.addresses.map(prepareUserAddressInfo).sort((a, b) => b.id - a.id),
  }
}

export const prepareUserLoginAttributesInfo = (loginHistory: UserLoginHistory): IUserLoginAttributesInfo => {
  const [width, height] = loginHistory.dimension.split('x')

  return {
    id: loginHistory.id,
    userId: loginHistory.user.id,
    userAgent: loginHistory.userAgent,
    ipAddress: loginHistory.ipAddress,
    dimension: {
      width: Number(width),
      height: Number(height),
    },
    loginSource: loginHistory.loginSource,
    loginType: loginHistory.loginType,
    platform: loginHistory.platform,
    sessionExpiry: new Date(loginHistory.sessionExpiry),
    loginAt: new Date(loginHistory.createdAt),
  }
}
