import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import Joi from 'joi'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'
import { IStaticPageDetail, IStaticPageUpdate } from '../../app/contract/staticPage'
import { IStaticPageService } from '../../app/services/interface'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/privacy-policy'

  registerCacheRoute(server, {
    method: 'get',
    path: '/detail',
    options: {
      tags: ['api'],
      validate: {},
    },
    handler: async (request: Hapi.Request): Promise<IStaticPageDetail> => {
      const staticPageService = appContainer.get<IStaticPageService>(AppTypes.StaticPageService)
      const privacyPolicyDetail = await staticPageService.getPrivacyPolicyDetail()
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return privacyPolicyDetail
    },
  })

  server.route({
    method: 'post',
    path: '/detail',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          title: Joi.string().required(),
          body: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IStaticPageUpdate> => {
      const staticPageService = appContainer.get<IStaticPageService>(AppTypes.StaticPageService)

      const payload = request.payload as any

      const updatePrivacyPolicy = await staticPageService.updatePrivacyPolicyDetail({
        title: payload.title,
        body: payload.body,
      })

      return updatePrivacyPolicy
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'privacyPolicyController',
    version: '1.0.0',
  }
}
