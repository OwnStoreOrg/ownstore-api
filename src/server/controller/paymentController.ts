import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { getUserInfoFromRequest, withUserToken } from '../utils/user'
import { IInitiatePayment, ISuccessfulPayment } from '../../app/contract/payment'
import { IPaymentService } from '../../app/services/interface'
import { PaymentMethodType } from '../../app/contract/constants'
import { VALID_EXTERNAL_HEADERS } from '../../app/constants'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/payment'

  server.route({
    method: 'post',
    path: '/user/session/initiate',
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<IInitiatePayment> => {
      const userInfo = getUserInfoFromRequest(request)

      const paymentService = appContainer.get<IPaymentService>(AppTypes.PaymentService)
      const paymentIntent = await paymentService.initiatePayment(userInfo.id)

      return paymentIntent
    },
  })

  server.route({
    method: 'post',
    path: '/user/session/successful',
    options: {
      tags: ['api'],
      validate: {
        payload: Joi.object({
          addressId: Joi.number().required(),
          thirdPartyPaymentId: Joi.string().required(),
          paymentMethod: Joi.string()
            .valid(...Object.values(PaymentMethodType))
            .required(),
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
    handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit): Promise<ISuccessfulPayment> => {
      const userInfo = getUserInfoFromRequest(request)

      const paymentService = appContainer.get<IPaymentService>(AppTypes.PaymentService)

      const payload = request.payload as any
      const paymentSuccessful = await paymentService.successfulPayment(userInfo.id, {
        addressId: payload.addressId,
        thirdPartyPaymentId: payload.thirdPartyPaymentId,
        paymentMethod: payload.paymentMethod,
      })

      return paymentSuccessful
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'paymentController',
    version: '1.0.0',
  }
}
