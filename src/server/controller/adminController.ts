import Hapi from '@hapi/hapi'
import { IAdminService, IHealthService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import { IHealthStatus } from '../../app/contract/health'
import appContainer from '../../app/container'
import Joi from 'joi'
import { VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { IAdminVerify, IAdminVerified } from '../../app/contract/admin'
import AppError from '../../app/errors/AppError'
import appConfig from '../../appConfig'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/admin'

  server.route({
    path: '/is-verified',
    method: 'get',
    options: {
      tags: ['api'],
      validate: {
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request): Promise<IAdminVerified> => {
      // If handler is called, then token is verified
      return {
        success: true,
      }
    },
  })

  server.route({
    method: 'post',
    path: '/verify',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          key: Joi.string().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IAdminVerify> => {
      const adminService = appContainer.get<IAdminService>(AppTypes.AdminService)
      const payload = request.payload as any
      const adminLogin = await adminService.adminLogin({
        key: payload.key,
      })
      return adminLogin
    },
  })

  server.route({
    method: 'get',
    path: '/cache/clear',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          key: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<string> => {
      const adminService = appContainer.get<IAdminService>(AppTypes.AdminService)
      const params = request.query as any
      if (params.key === appConfig.admin.cacheClearKey) {
        await adminService.clearCache()
        return 'Cache cleared!'
      }
      throw new AppError(401, 'Invalid key', 'INVALID_KEY', {
        key: params.key,
      })
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'adminController',
    version: '1.0.0',
  }
}
