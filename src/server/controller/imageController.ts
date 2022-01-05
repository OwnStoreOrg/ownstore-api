import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ICurrencyService, IImageService } from '../../app/services/interface'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import Joi from 'joi'
import { registerCacheRoute } from '../utils/hapi'
import { setResponseTtl } from '../utils/user'
import { IImageInfo, IImageInfoUpdate, IImageInfoUpdateParams } from '../../app/contract/image'
import { withAdminToken } from '../utils/admin'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/image'

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
    handler: async (request: Hapi.Request): Promise<IImageInfo[]> => {
      const imageService = appContainer.get<IImageService>(AppTypes.ImageService)
      const imageInfos = await imageService.getAllImageInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return imageInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{imageId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          imageId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IImageInfo> => {
      const imageService = appContainer.get<IImageService>(AppTypes.ImageService)
      const imageInfo = await imageService.getImageInfo(request.params.imageId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return imageInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{imageId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          imageId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          url: Joi.string().required(),
          meta: Joi.object({
            thirdPartyId: Joi.string()
              .required()
              .allow(null),
            originalName: Joi.string()
              .required()
              .allow(null),
            sizeInBytes: Joi.number()
              .required()
              .allow(null),
            width: Joi.number()
              .required()
              .allow(null),
            height: Joi.number()
              .required()
              .allow(null),
          })
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
    handler: async (request: Hapi.Request): Promise<IImageInfoUpdate> => {
      const imageService = appContainer.get<IImageService>(AppTypes.ImageService)

      const payload = request.payload as any

      const params: IImageInfoUpdateParams = {
        name: payload.name,
        url: payload.url,
        meta: null,
      }

      if (payload.meta) {
        params.meta = {
          thirdPartyId: payload.meta.thirdPartyId,
          originalName: payload.meta.originalName,
          sizeInBytes: payload.meta.sizeInBytes,
          width: payload.meta.width,
          height: payload.meta.height,
        }
      }

      const imageInfoUpdate = await imageService.updateImageInfo(request.params.imageId || null, params)
      return imageInfoUpdate
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
    handler: async (request: Hapi.Request): Promise<IImageInfo[]> => {
      const imageService = appContainer.get<IImageService>(AppTypes.ImageService)
      const imageInfos = await imageService.getAllImageInfosByQuery(request.params.imageId, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return imageInfos
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'imageController',
    version: '1.0.0',
  }
}
