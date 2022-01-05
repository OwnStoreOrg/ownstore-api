import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { IUserService } from '../../app/services/interface'
import {
  IUserRegisterationInfo,
  IUserInfo,
  IUserDetail,
  IUserEmailLoginInfo,
  IUserInfoUpdate,
  IUserRegisterationParams,
  IUserEmailLoginParams,
  IUserChangePasswordInfo,
  IUserChangePasswordParams,
  IUserGlobalDetail,
  IUserLoginAttributesInfo,
  IUserResetPasswordInfo,
  IUserResetPasswordParams,
} from '../../app/contract/user'
import Joi from 'joi'
import {
  getUserInfoFromRequest,
  prepareLoginAttributeParamsFromRequest,
  setResponseTtl,
  withUserToken,
} from '../utils/user'
import { LoginSourceType, LoginType, PlatformType } from '../../app/contract/constants'
import requestIp from 'request-ip'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { securityAnswersValidation } from './securityController'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'

export const loginAttributesValidation = Joi.object({
  userAgent: Joi.string().required(),
  ipAddress: Joi.string()
    .required()
    .allow(null),
  dimension: Joi.object({
    width: Joi.number().required(),
    height: Joi.number().required(),
  }),
  loginType: Joi.string()
    .valid(...Object.values(LoginType))
    .required(),
  loginSource: Joi.string()
    .valid(...Object.values(LoginSourceType))
    .required(),
  platform: Joi.string()
    .valid(...Object.values(PlatformType))
    .required(),
  url: Joi.string().required(),

  networkInformation: Joi.object({
    type: Joi.string()
      .optional()
      .allow(null),
    effectiveType: Joi.string()
      .optional()
      .allow(null),
  })
    .required()
    .allow(null),
})

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/user'

  registerCacheRoute(server, {
    method: 'get',
    path: '/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfo[]> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userInfos = await userService.getAllUserInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      return userInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/{userId}/info',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfo> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userInfo = await userService.getUserInfo(request.params.userId)
      return userInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/session/info',
    options: {
      tags: ['api'],
      validate: {
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfo> => {
      const userInfo = getUserInfoFromRequest(request)
      return userInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/search/{query}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          query: Joi.string().required(),
        }),
        query: Joi.object({
          limit: Joi.number().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfo[]> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userInfos = await userService.getAllUserInfosByQuery(request.params.query, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return userInfos
    },
  })

  server.route({
    method: 'put',
    path: '/{userId}/info',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
        }),
        payload: Joi.object({
          name: Joi.string()
            .pattern(new RegExp('^[^0-9]{3,50}$'))
            .required(),

          email: Joi.string()
            .email()
            .required(),

          phoneNumber: Joi.string()
            .required()
            .pattern(new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/))
            .allow(null),

          isActive: Joi.boolean()
            .required()
            .allow(null),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfoUpdate> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const payload = request.payload as any
      const userUpdateInfo = await userService.updateUserInfo(request.params.userId, {
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        isActive: payload.isActive,
      })

      return userUpdateInfo
    },
  })

  server.route({
    method: 'put',
    path: '/session/info',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          name: Joi.string()
            .pattern(new RegExp('^[^0-9]{3,50}$'))
            .required(),

          email: Joi.string()
            .email()
            .required(),

          phoneNumber: Joi.string()
            .required()
            .pattern(new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/))
            .allow(null),

          isActive: Joi.boolean()
            .required()
            .allow(null),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserInfoUpdate> => {
      const userInfo = getUserInfoFromRequest(request)

      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const payload = request.payload as any
      const userUpdateInfo = await userService.updateUserInfo(userInfo.id, {
        name: payload.name,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        // this will be forwarded only from admin-end. Hence hardcoding as null here.
        isActive: null,
      })

      return userUpdateInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/{userId}/detail',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserDetail> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userDetail = await userService.getUserDetail(request.params.userId)
      return userDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/session/detail',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          wishlist: Joi.boolean().optional(),
          cartDetail: Joi.boolean().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserDetail> => {
      const userInfo = getUserInfoFromRequest(request)
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userDetail = await userService.getUserDetail(userInfo.id)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LIVE)
      return userDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/{userId}/detail/global',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
        }),
        query: Joi.object({
          wishlist: Joi.boolean().optional(),
          cartDetail: Joi.boolean().optional(),
          orders: Joi.boolean().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserGlobalDetail> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userGlobalDetail = await userService.getUserGlobalDetail(request.params.userId, {
        wishlist: request.query.wishlist,
        cartDetail: request.query.cartDetail,
        orders: request.query.orders,
      })

      return userGlobalDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/session/detail/global',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          wishlist: Joi.boolean().optional(),
          cartDetail: Joi.boolean().optional(),
          orders: Joi.boolean().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserGlobalDetail> => {
      const user = getUserInfoFromRequest(request)

      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userGlobalDetail = await userService.getUserGlobalDetail(user.id, {
        wishlist: request.query.wishlist,
        cartDetail: request.query.cartDetail,
        orders: request.query.orders,
      })

      return userGlobalDetail
    },
  })

  server.route({
    method: 'post',
    path: '/register',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          name: Joi.string()
            .pattern(new RegExp('^[^0-9]{3,50}$'))
            .required(),
          email: Joi.string()
            .email()
            .required(),
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),
          loginAttributes: loginAttributesValidation,
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserRegisterationInfo> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const payload = request.payload as any

      const command: IUserRegisterationParams = {
        name: payload.name,
        email: payload.email,
        password: payload.password,
        loginAttributes: prepareLoginAttributeParamsFromRequest(request),
      }
      const userRegisterationInfo = await userService.registerUser(command)

      return userRegisterationInfo
    },
  })

  server.route({
    method: 'post',
    path: '/login/email',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          email: Joi.string()
            .email()
            .required(),
          password: Joi.string().optional(),
          passwordRequired: Joi.boolean().required(),
          longSession: Joi.boolean().optional(),
          loginAttributes: loginAttributesValidation,
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserEmailLoginInfo> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const payload = request.payload as any

      const command: IUserEmailLoginParams = {
        email: payload.email,
        password: payload.password,
        passwordRequired: payload.passwordRequired,
        longSession: payload.longSession,
        loginAttributes: prepareLoginAttributeParamsFromRequest(request),
      }
      const emailLoginInfo = await userService.emailLoginUser(command)

      return emailLoginInfo
    },
  })

  server.route({
    method: 'put',
    path: '/session/change-password',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          password: Joi.string().required(),
          newPassword: Joi.string().required(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserChangePasswordInfo> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const userInfo = getUserInfoFromRequest(request)

      const payload = request.payload as any
      const params: IUserChangePasswordParams = {
        password: payload.password,
        newPassword: payload.newPassword,
      }

      const changePasswordInfo = await userService.changePassword(userInfo.id, params)
      return changePasswordInfo
    },
  })

  server.route({
    method: 'post',
    path: '/reset-password',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          email: Joi.string().required(),
          password: Joi.string().required(),
          loginAttributes: loginAttributesValidation,
          securityAnswers: securityAnswersValidation,
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserResetPasswordInfo> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)

      const payload = request.payload as any
      const params: IUserResetPasswordParams = {
        email: payload.email,
        password: payload.password,
        loginAttributes: prepareLoginAttributeParamsFromRequest(request),
        securityAnswers: payload.securityAnswers,
      }

      const resetPasswordInfo = await userService.resetPassword(params)
      return resetPasswordInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/{userId}/login-history/info',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
        }),
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserLoginAttributesInfo[]> => {
      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userLoginHistory = await userService.getUserLoginAttributesInfo(request.params.userId, {
        offset: request.query.offset,
        limit: request.query.limit,
      })

      return userLoginHistory
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/session/login-history/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserLoginAttributesInfo[]> => {
      const userInfo = getUserInfoFromRequest(request)

      const userService = appContainer.get<IUserService>(AppTypes.UserService)
      const userLoginHistory = await userService.getUserLoginAttributesInfo(userInfo.id, {
        offset: request.query.offset,
        limit: request.query.limit,
      })

      return userLoginHistory
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'userController',
    version: '1.0.0',
  }
}
