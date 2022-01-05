import Hapi from '@hapi/hapi'
import Joi from 'joi'
import appContainer from '../../app/container'
import { ICatalogueInfo, ICatalogueInfoDelete, ICatalogueInfoUpdate } from '../../app/contract/catalogue'
import { ICatalogueService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/catalogue'

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
      },
    },
    handler: async (request: Hapi.Request): Promise<ICatalogueInfo[]> => {
      const catalogueService = appContainer.get<ICatalogueService>(AppTypes.CatalogueService)
      const catalogueInfos = await catalogueService.getAllCatalogueInfos({
        limit: request.query.limit,
        offset: request.query.offset,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return catalogueInfos
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
      },
    },
    handler: async (request: Hapi.Request): Promise<ICatalogueInfo[]> => {
      const catalogueService = appContainer.get<ICatalogueService>(AppTypes.CatalogueService)
      const catalogueInfos = await catalogueService.getAllCatalogueInfosByQuery(request.params.query, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return catalogueInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{catalogueId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          catalogueId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ICatalogueInfo> => {
      const catalogueService = appContainer.get<ICatalogueService>(AppTypes.CatalogueService)
      const catalogueInfo = await catalogueService.getCatalogueInfo(request.params.catalogueId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return catalogueInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{catalogueId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          catalogueId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          imageIds: Joi.string().required(),
          position: Joi.number().required(),
          isActive: Joi.boolean().required(),
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
    handler: async (request: Hapi.Request): Promise<ICatalogueInfoUpdate> => {
      const catalogueService = appContainer.get<ICatalogueService>(AppTypes.CatalogueService)

      const payload = request.payload as any

      const catalogueInfoUpdate = await catalogueService.updateCatalogueInfo(request.params.catalogueId || null, {
        name: payload.name,
        imageIds: payload.imageIds,
        position: payload.position,
        isActive: payload.isActive,
      })
      return catalogueInfoUpdate
    },
  })

  // server.route({
  //   method: 'delete',
  //   path: '/info/{catalogueId}',
  //   options: {
  //     tags: ['api'],
  //     validate: {
  //       params: Joi.object({
  //         catalogueId: Joi.number().required(),
  //       }),
  //       headers: Joi.object({
  //         [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
  //       }),
  //       options: {
  //         allowUnknown: true,
  //       },
  //     },
  //     pre: [{ method: withAdminToken }],
  //   },
  //   handler: async (request: Hapi.Request): Promise<ICatalogueInfoDelete> => {
  //     const catalogueService = appContainer.get<ICatalogueService>(AppTypes.CatalogueService)
  //     const catalogueInfoDelete = await catalogueService.deleteCatalogueInfo(request.params.catalogueId)
  //     return catalogueInfoDelete
  //   },
  // })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'catalogueController',
    version: '1.0.0',
  }
}
