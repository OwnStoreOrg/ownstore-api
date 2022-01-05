import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ISupportedRegionService } from '../../app/services/interface'
import {
  ISupportedRegionInfo,
  ISupportedRegionInfoDelete,
  ISupportedRegionInfoUpdate,
  ISupportedRegionsInfo,
} from '../../app/contract/supportedRegions'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import Joi from 'joi'
import { withAdminToken } from '../utils/admin'
import { SupportedRegionType } from '../../app/contract/constants'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/supported-region'

  registerCacheRoute(server, {
    method: 'get',
    path: '/info',
    options: {
      tags: ['api'],
      validate: {},
    },
    handler: async (request: Hapi.Request): Promise<ISupportedRegionsInfo> => {
      const supportedRegionsService = appContainer.get<ISupportedRegionService>(AppTypes.SupportedRegionsService)
      const supportedRegionsInfo = await supportedRegionsService.getSupportedRegionsInfo()
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return supportedRegionsInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/type/{supportedRegionType}/info/{supportedRegionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          supportedRegionType: Joi.string()
            .valid(...Object.values(SupportedRegionType))
            .required(),
          supportedRegionId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISupportedRegionInfo> => {
      const supportedRegionsService = appContainer.get<ISupportedRegionService>(AppTypes.SupportedRegionsService)
      const currencyInfo = await supportedRegionsService.getSupportedRegionById(
        request.params.supportedRegionId,
        request.params.supportedRegionType
      )
      return currencyInfo
    },
  })

  server.route({
    method: 'post',
    path: '/type/{supportedRegionType}/info/{supportedRegionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          supportedRegionType: Joi.string()
            .valid(...Object.values(SupportedRegionType))
            .required(),
          supportedRegionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          shortName: Joi.string().required(),
          flagUrl: Joi.string()
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
    handler: async (request: Hapi.Request): Promise<ISupportedRegionInfoUpdate> => {
      const supportedRegionsService = appContainer.get<ISupportedRegionService>(AppTypes.SupportedRegionsService)
      const payload = request.payload as any

      const updateSupportedRegionInfo = await supportedRegionsService.updateSupportedRegion(
        request.params.supportedRegionId || null,
        request.params.supportedRegionType,
        {
          name: payload.name,
          shortName: payload.shortName,
          flagUrl: payload.flagUrl,
        }
      )
      return updateSupportedRegionInfo
    },
  })

  server.route({
    method: 'delete',
    path: '/type/{supportedRegionType}/info/{supportedRegionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          supportedRegionType: Joi.string()
            .valid(...Object.values(SupportedRegionType))
            .required(),
          supportedRegionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ISupportedRegionInfoDelete> => {
      const supportedRegionsService = appContainer.get<ISupportedRegionService>(AppTypes.SupportedRegionsService)

      const deleteSupportedRegionInfo = await supportedRegionsService.deleteSupportedRegion(
        request.params.supportedRegionId || null,
        request.params.supportedRegionType
      )
      return deleteSupportedRegionInfo
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'supportedRegionsController',
    version: '1.0.0',
  }
}
