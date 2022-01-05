import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { IAddressService, IUserService } from '../../app/services/interface'
import { IUserAddressInfo, IUserAddressInfoUpdate } from '../../app/contract/address'
import Joi from 'joi'
import { getUserInfoFromRequest, setResponseTtl, withUserToken } from '../utils/user'
import { UserAddressType } from '../../app/contract/constants'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { registerCacheRoute } from '../utils/hapi'

const addressParamsValidation = Joi.object({
  name: Joi.string()
    .pattern(new RegExp('^[^0-9]{3,50}$'))
    .required(),
  phoneNumber: Joi.string()
    .pattern(new RegExp(/^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/))
    .required(),
  addressLine: Joi.string().required(),
  area: Joi.string().required(),
  areaCode: Joi.number()
    .required()
    .min(1)
    .allow(null),
  city: Joi.string().required(),
  country: Joi.string().required(),
  isPrimary: Joi.boolean().required(),
  isActive: Joi.boolean().required(),
  addressType: Joi.string()
    .valid(...Object.values(UserAddressType))
    .required(),
})

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/address'

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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserAddressInfo[]> => {
      const userInfo = getUserInfoFromRequest(request)

      const addressService = appContainer.get<IAddressService>(AppTypes.AddressService)
      const userAddresses = await addressService.getUserAddressInfos(userInfo.id, {
        offset: request.query.offset,
        limit: request.query.limit,
      })

      return userAddresses
    },
  })

  server.route({
    method: 'post',
    path: '/user/session/info',
    options: {
      tags: ['api'],
      validate: {
        payload: addressParamsValidation,
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserAddressInfoUpdate> => {
      const userInfo = getUserInfoFromRequest(request)

      const addressService = appContainer.get<IAddressService>(AppTypes.AddressService)

      const payload = request.payload as any
      const addUserAddessInfo = await addressService.addUserAddress(userInfo.id, {
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        addressLine: payload.addressLine,
        area: payload.area,
        areaCode: payload.areaCode,
        city: payload.city,
        country: payload.country,
        isPrimary: payload.isPrimary,
        isActive: payload.isActive,
        addressType: payload.addressType,
      })

      return addUserAddessInfo
    },
  })

  server.route({
    method: 'put',
    path: '/user/session/info/{addressId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          addressId: Joi.number().required(),
        }),
        payload: addressParamsValidation,
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withUserToken }],
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserAddressInfoUpdate> => {
      const userInfo = getUserInfoFromRequest(request)

      const addressService = appContainer.get<IAddressService>(AppTypes.AddressService)

      const payload = request.payload as any
      const updateUserAddessInfo = await addressService.updateUserAddress(userInfo.id, request.params.addressId, {
        name: payload.name,
        phoneNumber: payload.phoneNumber,
        addressLine: payload.addressLine,
        area: payload.area,
        areaCode: payload.areaCode,
        city: payload.city,
        country: payload.country,
        isPrimary: payload.isPrimary,
        isActive: payload.isActive,
        addressType: payload.addressType,
      })

      return updateUserAddessInfo
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'addressController',
    version: '1.0.0',
  }
}
