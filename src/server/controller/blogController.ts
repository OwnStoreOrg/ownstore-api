import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { IBlogInfo, IBlogInfoDelete, IBlogInfoUpdate } from '../../app/contract/blog'
import { IBlogService } from '../../app/services/interface'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/blog'

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
    handler: async (request: Hapi.Request): Promise<IBlogInfo[]> => {
      const blogService = appContainer.get<IBlogService>(AppTypes.BlogService)
      const blogInfos = await blogService.getAllBlogInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return blogInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{blogId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          blogId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IBlogInfo> => {
      const blogService = appContainer.get<IBlogService>(AppTypes.BlogService)
      const blogInfo = await blogService.getBlogInfo(request.params.blogId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return blogInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{blogId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          blogId: Joi.number().optional(),
        }),
        payload: Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
          url: Joi.string().required(),
          imageId: Joi.number()
            .required()
            .allow(null),
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
    handler: async (request: Hapi.Request): Promise<IBlogInfoUpdate> => {
      const blogService = appContainer.get<IBlogService>(AppTypes.BlogService)

      const payload = request.payload as any

      const blogInfoUpdate = await blogService.updateBlogInfo(request.params.blogId || null, {
        title: payload.title,
        description: payload.description,
        url: payload.url,
        imageId: payload.imageId,
        position: payload.position,
        isActive: payload.isActive,
      })
      return blogInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{blogId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          blogId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IBlogInfoDelete> => {
      const blogService = appContainer.get<IBlogService>(AppTypes.BlogService)
      const blogInfoDelete = await blogService.deleteBlogInfo(request.params.blogId)
      return blogInfoDelete
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
    handler: async (request: Hapi.Request): Promise<IBlogInfo[]> => {
      const blogService = appContainer.get<IBlogService>(AppTypes.BlogService)
      const blogInfos = await blogService.getAllBlogInfosByQuery(request.params.query, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return blogInfos
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'blogController',
    version: '1.0.0',
  }
}
