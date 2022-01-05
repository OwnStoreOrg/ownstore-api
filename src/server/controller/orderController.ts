import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { getUserInfoFromRequest, setResponseTtl, withUserToken } from '../utils/user'
import { IOrderService } from '../../app/services/interface'
import {
  IRefundOrderDetail,
  IOrderDetail,
  IOrderInfo,
  IOrderStatusInfo,
  IOrderStatusInfoUpdate,
  IOrderStatusInfoDelete,
  IUpdateOrderInfo,
} from '../../app/contract/order'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/order'

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
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
    handler: async (request: Hapi.Request): Promise<IOrderInfo[]> => {
      const userInfo = getUserInfoFromRequest(request)

      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderInfos = await orderService.getUserOrderInfos(userInfo.id, {
        offset: request.query.offset,
        limit: request.query.limit,
      })

      return orderInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/info/{orderId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          orderId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IOrderInfo> => {
      const userInfo = getUserInfoFromRequest(request)

      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderInfo = await orderService.getUserOrderInfo(userInfo.id, request.params.orderId)

      setResponseTtl(request, CONTROLLER_CACHE_TTL.LIVE)

      return orderInfo
    },
  })

  server.route({
    method: 'post',
    path: '/info/{orderId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          orderId: Joi.number().required(),
        }),
        payload: Joi.object({
          statusText: Joi.string()
            .required()
            .allow(null),
          orderStatusId: Joi.number()
            .required()
            .allow(null),
          cancellationReason: Joi.string()
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
    handler: async (request: Hapi.Request): Promise<IUpdateOrderInfo> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const payload = request.payload as any
      const updateOrderInfo = await orderService.updateOrderInfo(request.params.orderId, {
        statusText: payload.statusText,
        orderStatusId: payload.orderStatusId,
        cancellationReason: payload.cancellationReason,
      })
      return updateOrderInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/detail/{orderId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          orderId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IOrderDetail> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderDetail = await orderService.getOrderDetail(request.params.orderId)
      return orderDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/user/session/detail/{orderId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          orderId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IOrderDetail> => {
      const userInfo = getUserInfoFromRequest(request)

      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderDetail = await orderService.getUserOrderDetail(userInfo.id, request.params.orderId)

      return orderDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/recent/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
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
    handler: async (request: Hapi.Request): Promise<IOrderInfo[]> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderInfos = await orderService.getRecentOrders({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return orderInfos
    },
  })

  server.route({
    method: 'post',
    path: '/user/{userId}/detail/{orderId}/refund',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          userId: Joi.number().required(),
          orderId: Joi.number().required(),
        }),
        payload: Joi.object({
          reason: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IRefundOrderDetail> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)

      const payload = request.payload as any

      const deletedOrderInfo = await orderService.refundUserOrderDetail(request.params.userId, request.params.orderId, {
        reason: payload.reason,
      })

      return deletedOrderInfo
    },
  })

  server.route({
    method: 'post',
    path: '/user/session/detail/{orderId}/refund',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          orderId: Joi.number().required(),
        }),
        payload: Joi.object({
          reason: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IRefundOrderDetail> => {
      const userInfo = getUserInfoFromRequest(request)
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)

      const payload = request.payload as any

      const deletedOrderInfo = await orderService.refundUserOrderDetail(userInfo.id, request.params.orderId, {
        reason: payload.reason,
      })

      return deletedOrderInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/status/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IOrderStatusInfo[]> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderStatusInfos = await orderService.getAllOrderStatusInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return orderStatusInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/status/info/{statusId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          statusId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IOrderStatusInfo> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderStatusInfo = await orderService.getOrderStatusInfo(request.params.statusId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return orderStatusInfo
    },
  })

  server.route({
    method: 'post',
    path: '/status/info/{statusId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          statusId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IOrderStatusInfoUpdate> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)

      const payload = request.payload as any

      const orderStatusInfoUpdate = await orderService.updateOrderStatusInfo(request.params.statusId || null, {
        name: payload.name,
      })
      return orderStatusInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/status/info/{statusId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          statusId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IOrderStatusInfoDelete> => {
      const orderService = appContainer.get<IOrderService>(AppTypes.OrderService)
      const orderStatusInfoDelete = await orderService.deleteOrderStatusInfo(request.params.statusId)
      return orderStatusInfoDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'orderController',
    version: '1.0.0',
  }
}
