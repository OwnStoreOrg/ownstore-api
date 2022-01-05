import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { IFAQService } from '../../app/services/interface'
import { IFAQTopicInfo, IFAQInfo, IFAQTopicInfoUpdate, IFAQInfoUpdate, IFAQInfoDelete } from '../../app/contract/faq'
import Joi from 'joi'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { ICurrencyInfoDelete } from '../../app/contract/currency'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/faq'

  registerCacheRoute(server, {
    method: 'get',
    path: '/topic/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IFAQTopicInfo[]> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const faqTopicInfos = await faqService.getAllFAQTopicInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return faqTopicInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/topic/info/{faqTopicId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqTopicId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IFAQTopicInfo> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const faqTopicInfo = await faqService.getFAQTopicInfo(request.params.faqTopicId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return faqTopicInfo
    },
  })

  server.route({
    method: 'post',
    path: '/topic/info/{faqTopicId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqTopicId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IFAQTopicInfoUpdate> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)

      const payload = request.payload as any

      const updateFAQTopic = await faqService.updateFAQTopicInfo(request.params.faqTopicId || null, {
        name: payload.name,
        position: payload.position,
        isActive: payload.isActive,
      })
      return updateFAQTopic
    },
  })

  server.route({
    method: 'delete',
    path: '/topic/info/{faqTopicId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqTopicId: Joi.number().required(),
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
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const updateFAQTopic = await faqService.deleteFAQTopicInfo(request.params.faqTopicId)
      return updateFAQTopic
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/topic/{faqTopicId}/info',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqTopicId: Joi.number().required(),
        }),
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IFAQInfo[]> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const faqsDetail = await faqService.getFAQInfosByTopicId(request.params.faqTopicId, {
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return faqsDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{faqId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IFAQInfo> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const faqInfo = await faqService.getFAQInfoById(request.params.faqId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return faqInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{faqId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqId: Joi.number().optional(),
        }),
        payload: Joi.object({
          topicId: Joi.number().required(),
          question: Joi.string().required(),
          answer: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IFAQInfoUpdate> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)

      const payload = request.payload as any

      const faqInfoUpdate = await faqService.updateFAQInfo(request.params.faqId || null, {
        topicId: payload.topicId,
        question: payload.question,
        answer: payload.answer,
        position: payload.position,
        isActive: payload.isActive,
      })
      return faqInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{faqId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          faqId: Joi.number().optional(),
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
    handler: async (request: Hapi.Request): Promise<IFAQInfoDelete> => {
      const faqService = appContainer.get<IFAQService>(AppTypes.FAQService)
      const faqInfoDelete = await faqService.deleteFAQInfo(request.params.faqId)
      return faqInfoDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'faqController',
    version: '1.0.0',
  }
}
