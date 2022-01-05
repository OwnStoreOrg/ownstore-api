import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import { ICartService, IWishlistService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { ICartDetail } from '../../app/contract/cart'
import { getUserInfoFromRequest, setResponseTtl, withUserToken } from '../utils/user'
import { IUserWishInfo, IUserWishInfoAdd, IUserWishInfoDelete } from '../../app/contract/userWish'
import { ProductType } from '../../app/contract/constants'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/wish'

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/info',
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserWishInfo[]> => {
      const userInfo = getUserInfoFromRequest(request)

      const wishlistService = appContainer.get<IWishlistService>(AppTypes.WishlistService)
      const userWishInfos = await wishlistService.getUserWishInfos(userInfo.id)

      return userWishInfos
    },
  })

  server.route({
    method: 'post',
    path: '/user/session/info',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          productId: Joi.number().required(),
          productType: Joi.string()
            .valid(...Object.values(ProductType))
            .required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserWishInfoAdd> => {
      const userInfo = getUserInfoFromRequest(request)

      const wishlistService = appContainer.get<IWishlistService>(AppTypes.WishlistService)

      const payload = request.payload as any
      const addUserWish = await wishlistService.addUserWishInfo(userInfo.id, {
        productId: payload.productId,
        productType: payload.productType,
      })

      return addUserWish
    },
  })

  server.route({
    method: 'delete',
    path: '/user/session/info/{userWishId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userWishId: Joi.number().required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserWishInfoDelete> => {
      const userInfo = getUserInfoFromRequest(request)

      const wishlistService = appContainer.get<IWishlistService>(AppTypes.WishlistService)
      const deleteUserWish = await wishlistService.deleteUserWishInfo(userInfo.id, request.params.userWishId)

      return deleteUserWish
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'wishlistController',
    version: '1.0.0',
  }
}
