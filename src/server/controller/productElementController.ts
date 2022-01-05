import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { IProductElementService } from '../../app/services/interface'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import Joi from 'joi'
import { withAdminToken } from '../utils/admin'
import {
  IProductAttributeKeyInfo,
  IProductAttributeKeyInfoDelete,
  IProductAttributeKeyInfoUpdate,
  IProductBrandInfo,
  IProductBrandInfoDelete,
  IProductBrandInfoUpdate,
  IProductsRelationInfo,
} from '../../app/contract/product'
import { registerCacheRoute } from '../utils/hapi'
import { setResponseTtl } from '../utils/user'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/product/element'

  registerCacheRoute(server, {
    method: 'get',
    path: '/brand/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductBrandInfo[]> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productBrandInfos = await productElementService.getAllProductBrandInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productBrandInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/brand/info/{brandId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          brandId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductBrandInfo> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productBrandInfo = await productElementService.getProductBrandInfo(request.params.brandId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productBrandInfo
    },
  })

  server.route({
    method: 'post',
    path: '/brand/info/{brandId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          brandId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          description: Joi.string()
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
    handler: async (request: Hapi.Request): Promise<IProductBrandInfoUpdate> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)

      const payload = request.payload as any

      const productBrandInfoUpdate = await productElementService.updateProductBrandInfo(
        request.params.brandId || null,
        {
          name: payload.name,
          description: payload.description,
        }
      )
      return productBrandInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/brand/info/{brandId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          brandId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductBrandInfoDelete> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productBrandInfoDelete = await productElementService.deleteProductBrandInfo(request.params.brandId)
      return productBrandInfoDelete
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/attribute-key/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductAttributeKeyInfo[]> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productAttributeKeyInfos = await productElementService.getAllProductAttributeKeyInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productAttributeKeyInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/attribute-key/info/{attributeKeyId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          attributeKeyId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductAttributeKeyInfo> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productAttributeKeyInfo = await productElementService.getProductAttributeKeyInfo(
        request.params.attributeKeyId
      )
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productAttributeKeyInfo
    },
  })

  server.route({
    method: 'post',
    path: '/attribute-key/info/{attributeKeyId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          attributeKeyId: Joi.number().optional(),
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
    handler: async (request: Hapi.Request): Promise<IProductAttributeKeyInfoUpdate> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)

      const payload = request.payload as any

      const productAttributeKeyUpdate = await productElementService.updateProductAttributeKeyInfo(
        request.params.attributeKeyId || null,
        {
          name: payload.name,
        }
      )
      return productAttributeKeyUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/attribute-key/info/{attributeKeyId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          attributeKeyId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductAttributeKeyInfoDelete> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productBrandInfoDelete = await productElementService.deleteProductAttributeKeyInfo(
        request.params.attributeKeyId
      )
      return productBrandInfoDelete
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/relation/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductsRelationInfo[]> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productsRelationInfos = await productElementService.getAllProductsRelationInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productsRelationInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/relation/info/{relationId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          relationId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IProductAttributeKeyInfo> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productsRelationInfo = await productElementService.getProductsRelationInfo(request.params.relationId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productsRelationInfo
    },
  })

  server.route({
    method: 'post',
    path: '/relation/info/{relationId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          relationId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          description: Joi.string()
            .required()
            .allow(null),
          productIds: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductBrandInfoUpdate> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)

      const payload = request.payload as any

      const productsRelationInfoUpdate = await productElementService.updateProductsRelationInfo(
        request.params.relationId || null,
        {
          name: payload.name,
          description: payload.description,
          productIds: payload.productIds,
        }
      )
      return productsRelationInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/relation/info/{relationId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          relationId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductBrandInfoDelete> => {
      const productElementService = appContainer.get<IProductElementService>(AppTypes.ProductElementService)
      const productsRelationInfoDelete = await productElementService.deleteProductsRelationInfo(
        request.params.relationId
      )
      return productsRelationInfoDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'productElementController',
    version: '1.0.0',
  }
}
