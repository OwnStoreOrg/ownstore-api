import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ISecurityService, IUserService } from '../../app/services/interface'
import {
  IUserUpdateSecurityPasswordHintInfo,
  IUserSecurityQuestionsDetail,
  IUserUpdateSecurityQuestionAnswer,
  IUserVerifySecurityQuestionAnswer,
} from '../../app/contract/security'
import Joi from 'joi'
import { getUserInfoFromRequest, setResponseTtl, withUserToken } from '../utils/user'
import {
  IISecurityQuestionInfoDelete,
  IISecurityQuestionInfoUpdate,
  ISecurityQuestionInfo,
} from '../../app/contract/security'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'

export const securityAnswersValidation = Joi.array()
  .items(
    Joi.object({
      questionId: Joi.number().required(),
      answer: Joi.string().required(),
    })
  )
  .required()

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/security'

  server.route({
    method: 'post',
    path: '/user/session/password-hint/info',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),
          hint: Joi.string().required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserUpdateSecurityPasswordHintInfo> => {
      const userInfo = getUserInfoFromRequest(request)

      const payload = request.payload as any

      const userService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const updatedPasswordHintInfo = await userService.updateUserPasswordHintInfo(userInfo.id, {
        password: payload.password,
        hint: payload.hint,
      })

      return updatedPasswordHintInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/security-question/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<ISecurityQuestionInfo[]> => {
      const userService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const allSecurityQuestions = await userService.getAllSecurityQuestions({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return allSecurityQuestions
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/security-question/info/{questionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          questionId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISecurityQuestionInfo> => {
      const securityService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const securityquestionInfo = await securityService.getSecurityQuestion(request.params.questionId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return securityquestionInfo
    },
  })

  server.route({
    method: 'post',
    path: '/security-question/info/{questionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          questionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          question: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IISecurityQuestionInfoUpdate> => {
      const securityService = appContainer.get<ISecurityService>(AppTypes.SecurityService)

      const payload = request.payload as any

      const currencyInfoUpdate = await securityService.updateSecurityQuestion(request.params.questionId || null, {
        question: payload.question,
      })
      return currencyInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/security-question/info/{questionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          questionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IISecurityQuestionInfoDelete> => {
      const securityService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const currencyInfoDelete = await securityService.deleteSecurityQuestion(request.params.questionId)
      return currencyInfoDelete
    },
  })

  server.route({
    method: 'post',
    path: '/security-questions/verify',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          email: Joi.string()
            .email()
            .required(),
          securityAnswers: securityAnswersValidation,
        }),
      },
    },
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserVerifySecurityQuestionAnswer> => {
      const payload = request.payload as any

      const userService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const verifySecurityQuestions = await userService.verifyUserSecurityQuestionAnswers({
        email: payload.email,
        securityAnswers: payload.securityAnswers,
      })

      return verifySecurityQuestions
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/security-questions/detail',
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserSecurityQuestionsDetail> => {
      const userInfo = getUserInfoFromRequest(request)

      const userService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const securityQuestionsDetail = await userService.getUserSecurityQuestionsDetail(userInfo.id)

      return securityQuestionsDetail
    },
  })

  server.route({
    method: 'post',
    path: '/user/session/security-questions/info',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
            .required(),
          securityAnswers: securityAnswersValidation,
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IUserUpdateSecurityQuestionAnswer> => {
      const userInfo = getUserInfoFromRequest(request)

      const payload = request.payload as any

      const userService = appContainer.get<ISecurityService>(AppTypes.SecurityService)
      const updatedSecurityQuestions = await userService.updateUserSecurityQuestionAnswers(userInfo.id, {
        password: payload.password,
        securityAnswers: payload.securityAnswers,
      })

      return updatedSecurityQuestions
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'securityController',
    version: '1.0.0',
  }
}
