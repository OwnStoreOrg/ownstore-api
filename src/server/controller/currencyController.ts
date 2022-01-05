import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ICurrencyService } from '../../app/services/interface'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { ICurrencyInfo, ICurrencyInfoDelete, ICurrencyInfoUpdate } from '../../app/contract/currency'
import Joi from 'joi'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'
import { setResponseTtl } from '../utils/user'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/currency'

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
    handler: async (request: Hapi.Request): Promise<ICurrencyInfo[]> => {
      const currencyService = appContainer.get<ICurrencyService>(AppTypes.CurrencyService)
      const currencyInfos = await currencyService.getAllCurrencyInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return currencyInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{currencyId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          currencyId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICurrencyInfo> => {
      const currencyService = appContainer.get<ICurrencyService>(AppTypes.CurrencyService)
      const currencyInfo = await currencyService.getCurrencyInfo(request.params.currencyId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return currencyInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{currencyId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          currencyId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          isoCode: Joi.string().required(),
          symbol: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<ICurrencyInfoUpdate> => {
      const currencyService = appContainer.get<ICurrencyService>(AppTypes.CurrencyService)

      const payload = request.payload as any

      const currencyInfoUpdate = await currencyService.updateCurrencyInfo(request.params.currencyId || null, {
        name: payload.name,
        isoCode: payload.isoCode,
        symbol: payload.symbol,
      })
      return currencyInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{currencyId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          currencyId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICurrencyInfoDelete> => {
      const currencyService = appContainer.get<ICurrencyService>(AppTypes.CurrencyService)
      const currencyInfoDelete = await currencyService.deleteCurrencyInfo(request.params.currencyId)
      return currencyInfoDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'currencyController',
    version: '1.0.0',
  }
}
