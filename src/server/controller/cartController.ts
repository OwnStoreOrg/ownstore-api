import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import { ICartService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { ICartDetail, IUserCartItemAdd, IUserCartItemDelete } from '../../app/contract/cart'
import { getUserInfoFromRequest, setResponseTtl, withUserToken } from '../utils/user'
import { ProductType } from '../../app/contract/constants'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/cart'

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/detail',
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
    handler: async (request: Hapi.Request): Promise<ICartDetail> => {
      const userInfo = getUserInfoFromRequest(request)

      const cartService = appContainer.get<ICartService>(AppTypes.CartService)
      const cartDetail = await cartService.getUserCartDetail(userInfo.id)

      return cartDetail
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
          totalQuantity: Joi.number().required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserCartItemAdd> => {
      const userInfo = getUserInfoFromRequest(request)

      const cartService = appContainer.get<ICartService>(AppTypes.CartService)

      const payload = request.payload as any
      const addUserCart = await cartService.addUserCartItem(userInfo.id, {
        productId: payload.productId,
        productType: payload.productType,
        totalQuantity: payload.totalQuantity,
      })

      return addUserCart
    },
  })

  server.route({
    method: 'delete',
    path: '/user/session/info/{cartId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          cartId: Joi.number().required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserCartItemDelete> => {
      const userInfo = getUserInfoFromRequest(request)

      const cartService = appContainer.get<ICartService>(AppTypes.CartService)
      const removeUserCart = await cartService.deleteUserCartItem(userInfo.id, request.params.cartId)

      return removeUserCart
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'cartController',
    version: '1.0.0',
  }
}
