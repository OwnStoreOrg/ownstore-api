import Hapi, { ResponseObject } from '@hapi/hapi'
import appConfig from '../appConfig'
import { hapiLogger, appLogger } from '../logger'
import Boom from '@hapi/boom'
import AppError from '../app/errors/AppError'
import healthController from './controller/healthController'
import catalogueController from './controller/catalogueController'
import productController from './controller/productController'
import productElementController from './controller/productElementController'
import blogController from './controller/blogController'
import sectionController from './controller/sectionController'
import sectionItemController from './controller/sectionItemController'
import userController from './controller/userController'
import addressController from './controller/addressController'
import supportedRegionsController from './controller/supportedRegionsController'
import currencyController from './controller/currencyController'
import faqController from './controller/faqController'
import searchController from './controller/searchController'
import tncController from './controller/tncController'
import privacyPolicyController from './controller/privacyPolicyController'
import refundPolicyController from './controller/refundPolicyController'
import shippingPolicyController from './controller/shippingPolicyController'
import wishlistController from './controller/wishlistController'
import cartController from './controller/cartController'
import paymentController from './controller/paymentController'
import orderController from './controller/orderController'
import securityController from './controller/securityController'
import adminController from './controller/adminController'
import imageController from './controller/imageController'
import { captureException } from '@sentry/minimal'
import { IUserInfo } from '../app/contract/user'
import { User, CaptureContext } from '@sentry/types'
import { IServerAppState } from './interface'
import { VALID_EXTERNAL_HEADERS } from '../app/constants'
import { CacheControlMode } from '../support/cache'
import { getRequestCacheMode } from './utils/hapi'

const plugins: Hapi.ServerRegisterPluginObject<any>[] = [
  require('@hapi/inert'),
  require('@hapi/vision'),
  {
    plugin: require('hapi-pino'),
    options: {
      instance: hapiLogger,
      logRequestStart: false,
      logRequestComplete: false,
      logPayload: true,
      logEvents: ['request-error'],
    },
  },
]

if (appConfig.global.showDoc) {
  plugins.push({
    plugin: require('hapi-swagger'),
    options: {
      schemes: ['https'],
      host: appConfig.global.domain,
      info: {
        title: `${appConfig.global.app.name} API Documentation`,
        contact: {
          name: appConfig.global.app.name,
          email: appConfig.global.app.supportEmail,
        },
      },
    },
  })
}

export default class Server {
  public static async init(): Promise<void> {
    const server = new Hapi.Server({
      host: '0.0.0.0',
      port: process.env.PORT || 3001,
      debug: false,
      routes: {
        cache: {
          privacy: 'public',
        },
        validate: {
          options: {
            abortEarly: true,
          },
        },
        cors: {
          origin: [...appConfig.global.clientOrigins],
          additionalHeaders: [...Object.values(VALID_EXTERNAL_HEADERS)],
          additionalExposedHeaders: [VALID_EXTERNAL_HEADERS.RESPONSE_CACHE_TIME],
          maxAge: 2 * 86400, // 2 days
        },
      },
    })

    server.listener.keepAliveTimeout = 60 * 1000
    server.listener.headersTimeout = 60 * 1000

    await server.register(plugins)
    await server.register(healthController())
    await server.register(catalogueController())
    await server.register(productController())
    await server.register(productElementController())
    await server.register(blogController())
    await server.register(sectionController())
    await server.register(sectionItemController())
    await server.register(userController())
    await server.register(addressController())
    await server.register(supportedRegionsController())
    await server.register(currencyController())
    await server.register(faqController())
    await server.register(searchController())
    await server.register(tncController())
    await server.register(privacyPolicyController())
    await server.register(wishlistController())
    await server.register(cartController())
    await server.register(paymentController())
    await server.register(orderController())
    await server.register(securityController())
    await server.register(refundPolicyController())
    await server.register(shippingPolicyController())
    await server.register(adminController())
    await server.register(imageController())

    server.ext('onPreResponse', (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
      const response = request.response

      if (Boom.isBoom(response)) {
        const boomResponse = response as Boom.Boom
        const boomOutput = boomResponse.output
        const boomPayload = boomOutput.payload
        const boomData = boomResponse.data

        let code = boomData && boomData.code ? boomData.code : 'UNKNOWN'
        let data = boomData && boomData.data ? boomData.data : null
        let message = boomPayload.message

        if (AppError.isAppError(response as Error)) {
          const appError = (response as unknown) as AppError
          boomOutput.statusCode = appError.status

          message = appError.message
          code = appError.code || code
          data = appError.data || data
        }

        // @ts-ignore
        boomOutput.payload = {
          status: boomOutput.statusCode,
          error: boomPayload.error,
          message: message,
          code: code,
          data: data,
        }

        if (appConfig.integrations.sentryErrorReporting.enabled) {
          let user: User | undefined = undefined

          const hapiUser: IUserInfo | null = (request.app as IServerAppState).user
          if (hapiUser) {
            user = {
              id: `${hapiUser.id}`,
              ip_address: '{{auto}}',
            }
          }

          const sentryContext: CaptureContext = {
            user: user,
            extra: {
              payload: boomOutput.payload,
              headers: request.headers,
              userSession: hapiUser,
              route: {
                route: request.route,
                url: request.url,
                params: request.params,
                query: request.query,
              },
            },
          }

          if (appConfig.errors.report4xxErrors) {
            captureException(response, sentryContext)
          } else {
            if (boomOutput.statusCode >= 500) {
              captureException(response, sentryContext)
            }
          }
        }
      } else {
        if ((response as ResponseObject).statusCode === 200) {
          const responseObj: ResponseObject = response as ResponseObject

          if (appConfig.cache.httpResponse.enabled && request.method === 'get') {
            responseObj.header(VALID_EXTERNAL_HEADERS.RESPONSE_CACHE_TIME, new Date().toISOString())

            const cacheMode = getRequestCacheMode(request)

            if (cacheMode !== CacheControlMode.NO_CACHE) {
              const responseTtl = (request.app as IServerAppState).responseTtl || 0
              responseObj.ttl(responseTtl * 1000)
            }
          }
        }
      }

      return h.continue
    })

    await server.start()

    appLogger.info('server running on %s', server.info.uri)
  }
}
