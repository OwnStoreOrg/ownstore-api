import { INetworkInformationInfo } from '../../contract/common'
import { PlatformType, UserAddressType } from '../../contract/constants'
import { LoginSourceType, LoginType } from '../../contract/constants'
import { ISecurityAnswerInfo } from '../../contract/security'

export interface IUserRegisterationCommand {
  name: string
  email: string
  password: string
}

export interface IUserLoginAttributesAddCommand {
  userAgent: string
  dimension: {
    width: number
    height: number
  }
  ipAddress: string | null
  loginSource: LoginSourceType
  loginType: LoginType
  platform: PlatformType
  url: string
  sessionExpiry: Date
  networkInformation: INetworkInformationInfo | null
}

export interface IUserUpdateCommand {
  userId: number
  name: string | null
  email: string | null
  phoneNumber: string | null
  password: string | null
  isActive: boolean | null
}

export interface IUserAddressUpdateCommand {
  addressId: number | null
  userId: number
  name: string
  phoneNumber: string
  addressLine: string
  area: string
  areaCode: number | null
  city: string
  country: string
  isPrimary: boolean
  isActive: boolean
  addressType: UserAddressType
}

export interface IUserUpdatePasswordHintCommand {
  hint: string
}

export interface IUserUpdateSecurityQuestionAnswerCommand {
  securityAnswers: ISecurityAnswerInfo[]
}
