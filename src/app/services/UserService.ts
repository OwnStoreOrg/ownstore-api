import { inject, injectable } from 'inversify'
import BaseService from './BaseService'
import {
  ICartService,
  IOrderService,
  ISecurityService,
  ISettingService,
  IUserService,
  IWishlistService,
} from './interface'
import {
  IUserRegisterationInfo,
  IUserInfo,
  IUserDetail,
  IUserEmailLoginInfo,
  IUserInfoUpdate,
  IUserRegisterationParams,
  IUserEmailLoginParams,
  IUserInfoUpdateParams,
  IUserChangePasswordParams,
  IUserChangePasswordInfo,
  IUserGlobalDetailParams,
  IUserGlobalDetail,
  IUserLoginAttributesInfo,
  IUserLoginAttributesInfoParams,
  IUserResetPasswordParams,
  IUserResetPasswordInfo,
} from '../contract/user'
import bcrypt from 'bcrypt'
import { prepareUserDetail, prepareUserInfo, prepareUserLoginAttributesInfo } from '../transformers/user'
import AppError from '../errors/AppError'
import jwt from 'jsonwebtoken'
import appConfig from '../../appConfig'
import { isEmptyObject } from '../utils/common'
import { EntityNotFoundError } from '../errors/EntityError'
import { IFindParams } from '../contract/common'
import AppTypes from '../AppTypes'
import ms from 'ms'
import { CacheBuild, CacheBulkBuild, CacheBulkPurge, CachePurge } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'
import { lazyInject } from '../container'

@injectable()
export default class UserService extends BaseService implements IUserService {
  @lazyInject(AppTypes.WishlistService)
  private wishlistService!: IWishlistService

  @lazyInject(AppTypes.SettingService)
  private settingService!: ISettingService

  @lazyInject(AppTypes.CartService)
  private cartService!: ICartService

  @lazyInject(AppTypes.OrderService)
  private orderService!: IOrderService

  @CacheBulkBuild('US', [[0], [1]], SERVICE_CACHE_TTL.DEFAULT, 'USIS')
  private async _prepareUserState(
    isDetail: boolean,
    userIds: number[]
  ): Promise<Record<number, IUserInfo | IUserDetail>> {
    const result: Record<number, IUserInfo | IUserDetail> = {}

    const users = await this.getUserRepository().getBulk(userIds)

    for (const [userId, user] of Object.entries(users)) {
      let userInfo: IUserInfo | IUserDetail | null = null

      if (isDetail) {
        const userDetail = prepareUserDetail(user)
        userInfo = userDetail
      } else {
        userInfo = prepareUserInfo(user)
      }

      result[userId] = userInfo
    }

    return result
  }

  @CacheBulkPurge('US', [[0], [1]], 'USIS')
  private async _clearUserStateCache(isDetail: boolean, userIds: number[]): Promise<void> {}

  @CacheBuild(
    'US',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'USIL'
  )
  public async getAllUserInfos(findParams: IFindParams): Promise<IUserInfo[]> {
    const userIds = await this.getUserRepository().getBulkIds(findParams)
    const users = await this._prepareUserState(false, userIds)
    return Object.values(users).sort((a, b) => b.id - a.id)
  }

  public async getUserInfo(userId: number): Promise<IUserInfo> {
    const userInfos = await this._prepareUserState(false, [userId])
    const userInfo = userInfos[userId]

    if (!userInfo) {
      throw new EntityNotFoundError('User', userId)
    }

    return userInfo
  }

  public async getUserDetail(userId: number): Promise<IUserDetail> {
    const userDetails = await this._prepareUserState(true, [userId])
    const userDetail = userDetails[userId] as IUserDetail | null

    if (!userDetail) {
      throw new EntityNotFoundError('User', userId)
    }

    return userDetail
  }

  @CacheBuild('US', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'UIQS')
  public async getAllUserInfosByQuery(query: string, findParams: IFindParams): Promise<IUserInfo[]> {
    const userIds = await this.getUserRepository().getBulkIdsByName(query, findParams)

    if (!userIds.length) {
      return []
    }

    const catalogues = await this._prepareUserState(false, userIds)
    return Object.values(catalogues)
  }

  public async updateUserInfo(userId: number, params: IUserInfoUpdateParams): Promise<IUserInfoUpdate> {
    await this._clearUserStateCache(true, [userId])
    await this._clearUserStateCache(false, [userId])

    await this.getUserRepository().updateUserInfo({
      ...params,
      userId: userId,
      phoneNumber: null,
      password: null,
      isActive: params.isActive,
    })
    return {
      success: true,
    }
  }

  public async getUserGlobalDetail(userId: number, params: IUserGlobalDetailParams): Promise<IUserGlobalDetail> {
    const result: IUserGlobalDetail = {
      // @ts-ignore
      userDetail: null,
      // @ts-ignore
      setting: null,
      wishlist: null,
      cartDetail: null,
      orders: null,
    }

    const [userDetail, setting, wishlist, cartDetail, orders] = await Promise.all([
      this.getUserDetail(userId),
      this.settingService.getSettingInfo(userId),
      params.wishlist ? this.wishlistService.getUserWishInfos(userId) : null,
      params.cartDetail ? this.cartService.getUserCartDetail(userId) : null,
      params.orders ? this.orderService.getUserOrderInfos(userId, {}) : null,
    ])

    result.userDetail = userDetail
    result.setting = setting
    result.wishlist = wishlist
    result.cartDetail = cartDetail
    result.orders = orders

    return result
  }

  private async _signUserToken(userDetail: IUserDetail, longSession: boolean): Promise<string> {
    const userInfo: IUserInfo = {
      id: userDetail.id,
      name: userDetail.name,
      email: userDetail.email,
      phoneNumber: userDetail.phoneNumber,
      joinedDateTime: userDetail.joinedDateTime,
      isActive: userDetail.isActive,
    }

    const signedToken = jwt.sign(userInfo, appConfig.userAuth.tokenSecret as string, {
      expiresIn: longSession ? appConfig.userAuth.tokenExpiry.extended : appConfig.userAuth.tokenExpiry.default,
    })
    return signedToken
  }

  public async registerUser(params: IUserRegisterationParams): Promise<IUserRegisterationInfo> {
    let result: IUserRegisterationInfo = {
      success: false,
      message: null,
      token: null,
      user: null,
    }

    if (!appConfig.allow.newRegisterations) {
      result.message = 'Registerations not allowed'
      throw new AppError(403, result.message, 'REGISTERATIONS_DISABLED', result)
    }

    const user = await this.getUserRepository().getUserByEmail(params.email)

    if (user) {
      const emailLoginInfo = await this.emailLoginUser({
        email: params.email,
        password: params.password,
        passwordRequired: true,
        longSession: false,
        loginAttributes: params.loginAttributes,
      })
      result = emailLoginInfo
    } else {
      const hashedPassword = bcrypt.hashSync(params.password, 10)
      const addCommand = params
      addCommand.password = hashedPassword

      const { id } = await this.getUserRepository().addUser({
        ...addCommand,
      })
      const registeredUser = await this.getUserRepository().getBulk([id])
      const userDetail = prepareUserDetail(registeredUser[id])
      const signedToken = await this._signUserToken(userDetail, false)

      await this.addUserLoginAttributesInfo(userDetail.id, params.loginAttributes, false)

      result.success = true
      result.token = signedToken
      result.message = `Account created successfully!`
      result.user = userDetail
    }

    return result
  }

  public async emailLoginUser(params: IUserEmailLoginParams): Promise<IUserEmailLoginInfo> {
    const result: IUserEmailLoginInfo = {
      success: false,
      message: null,
      token: null,
      user: null,
    }

    const user = await this.getUserRepository().getUserByEmail(params.email)

    if (!user) {
      result.message = 'No such user found!'
      throw new AppError(404, result.message, 'INVALID_CREDENTIALS', result)
    } else {
      const passwordMatched = bcrypt.compareSync(params.password || '', user.password)

      if (params.passwordRequired && !passwordMatched) {
        result.message = 'Wrong password!'
        throw new AppError(401, result.message, 'INVALID_PASSWORD', result)
      } else {
        const userDetail = prepareUserDetail(user)
        const signedToken = await this._signUserToken(userDetail, params.longSession)

        await this.addUserLoginAttributesInfo(user.id, params.loginAttributes, params.longSession)

        result.success = true
        result.message = 'Logged in successfully!'
        result.token = signedToken
        result.user = userDetail
      }
    }

    return result
  }

  public async changePassword(userId: number, params: IUserChangePasswordParams): Promise<IUserChangePasswordInfo> {
    const users = await this.getUserRepository().getBulk([userId])

    if (isEmptyObject(users)) {
      throw new EntityNotFoundError('User', userId)
    }

    const result: IUserChangePasswordInfo = {
      success: false,
      message: null,
    }

    const { password: dbPassword } = users[userId]

    const passwordMatched = bcrypt.compareSync(params.password, dbPassword)

    if (!passwordMatched) {
      result.message = 'Incorrect password!'
      throw new AppError(401, result.message, 'INCORRECT_PASSWORD', result)
    } else {
      await this.getUserRepository().updateUserInfo({
        userId: userId,
        name: null,
        email: null,
        phoneNumber: null,
        isActive: null,
        password: bcrypt.hashSync(params.newPassword, 10),
      })
      result.message = 'Password updated'
      result.success = true
    }

    return result
  }

  public async resetPassword(params: IUserResetPasswordParams): Promise<IUserResetPasswordInfo> {
    const result: IUserResetPasswordInfo = {
      success: false,
      message: null,
      token: null,
      user: null,
    }

    const user = await this.getUserRepository().getUserByEmail(params.email)

    if (!user) {
      throw new AppError(404, 'Invalid email', 'INVALID_EMAIL')
    }

    await this.getUserRepository().updateUserInfo({
      userId: user.id,
      name: null,
      email: null,
      phoneNumber: null,
      isActive: null,
      password: bcrypt.hashSync(params.password, 10),
    })

    const userDetail = prepareUserDetail(user)
    const signedToken = await this._signUserToken(userDetail, false)

    await this.addUserLoginAttributesInfo(user.id, params.loginAttributes, false)

    result.message = 'Password updated'
    result.success = true
    result.token = signedToken
    result.user = userDetail

    return result
  }

  @CachePurge('US', [[0]], 'LAIL', true)
  public async addUserLoginAttributesInfo(
    userId: number,
    loginAttributes: IUserLoginAttributesInfoParams,
    longSession: boolean
  ): Promise<void> {
    const sessionExpiryDate = new Date()

    if (longSession) {
      sessionExpiryDate.setMilliseconds(ms(appConfig.userAuth.tokenExpiry.extended))
    } else {
      sessionExpiryDate.setMilliseconds(ms(appConfig.userAuth.tokenExpiry.default))
    }

    await this.getuserLoginHistoryRepository().add(userId, {
      ...loginAttributes,
      sessionExpiry: sessionExpiryDate,
    })
  }

  @CacheBuild('US', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.DEFAULT, 'LAIL')
  public async getUserLoginAttributesInfo(
    userId: number,
    findParams: IFindParams
  ): Promise<IUserLoginAttributesInfo[]> {
    const userLoginHistory = await this.getuserLoginHistoryRepository().getBulkByUserId(userId, findParams)
    return userLoginHistory.map(prepareUserLoginAttributesInfo)
  }
}
