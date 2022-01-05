import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import { IProductService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import {
  IIndividualProductInfo,
  IComboProductInfo,
  IComboProductDetail,
  IIndividualProductDetailUpdate,
  IIndividualProductDetailUpdateParams,
  IComboProductDetailUpdate,
  IComboProductDetailUpdateParams,
  IIndividualProductDetailDelete,
  IIndividualProductDetailDeleteParams,
  IComboProductDetailDelete,
  IComboProductDetailDeleteParams,
} from '../../app/contract/product'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { ProductTagIconType, ProductType } from '../../app/contract/constants'
import { registerCacheRoute } from '../utils/hapi'

const getProductUpdatePayload = (productType: ProductType) => {
  const inputs = Joi.object({
    basic: Joi.object({
      name: Joi.string().required(),
      shortName: Joi.string()
        .required()
        .allow(null),
      description: Joi.string().required(),
      position: Joi.number().required(),
      isActive: Joi.boolean().required(),
      seo: Joi.object({
        title: Joi.string()
          .required()
          .allow(null),
        description: Joi.string()
          .required()
          .allow(null),
        keywords: Joi.array()
          .required()
          .allow(null),
      }).required(),

      ...(productType === ProductType.INDIVIDUAL && { catalogueId: Joi.number().required() }),

      imageIds: Joi.string().required(),
    })
      .required()
      .allow(null),

    ...(productType === ProductType.INDIVIDUAL && {
      brandId: Joi.number()
        .required()
        .allow(null),
    }),

    productsRelationId: Joi.number()
      .required()
      .allow(null),

    sku: Joi.object({
      id: Joi.number()
        .required()
        .allow(null),
      name: Joi.string().required(),
      retailPrice: Joi.number().required(),
      salePrice: Joi.number().required(),
      onSale: Joi.boolean().required(),
      currencyId: Joi.number().required(),
      saleDiscountPercentage: Joi.number()
        .required()
        .allow(null),
      saleDiscountFlat: Joi.number()
        .required()
        .allow(null),
      availableQuantity: Joi.number().required(),
      comingSoon: Joi.boolean().required(),
    })
      .required()
      .allow(null),

    tags: Joi.array()
      .items(
        Joi.object({
          id: Joi.number()
            .required()
            .allow(null),
          iconType: Joi.string()
            .valid(...Object.values(ProductTagIconType))
            .required(),
          label: Joi.string().required(),
          position: Joi.number().required(),
          isActive: Joi.boolean().required(),
        })
      )
      .required()
      .allow(null),

    attributes: Joi.array()
      .items(
        Joi.object({
          id: Joi.number()
            .required()
            .allow(null),
          keyId: Joi.number()
            .required()
            .allow(null),
          value: Joi.string().required(),
          position: Joi.number().required(),
          isActive: Joi.boolean().required(),
        })
      )
      .required()
      .allow(null),

    featureSections: Joi.array()
      .items(
        Joi.object({
          id: Joi.number()
            .required()
            .allow(null),
          title: Joi.string().required(),
          body: Joi.string().required(),
          position: Joi.number().required(),
          isActive: Joi.boolean().required(),
        })
      )
      .required()
      .allow(null),
  })

  return inputs
}

const getProductDeletePayload = (productType: ProductType) => {
  const result = Joi.object({
    tags: Joi.array()
      .items(Joi.number())
      .required()
      .allow(null),
    attributes: Joi.array()
      .items(Joi.number())
      .required()
      .allow(null),
    featureSections: Joi.array()
      .items(Joi.number())
      .required()
      .allow(null),
  })

  return result
}

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/product'

  registerCacheRoute(server, {
    method: 'get',
    path: '/individual/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductInfo[]> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const productInfos = await productService.getAllIndividualProductInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/individual/info/{productId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductInfo> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const productInfo = await productService.getIndividualProductInfo(request.params.productId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/individual/detail/{productId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductInfo> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const productDetail = await productService.getIndividualProductDetail(request.params.productId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return productDetail
    },
  })

  server.route({
    method: 'post',
    path: '/individual/detail/{productId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().optional(),
        }),
        payload: getProductUpdatePayload(ProductType.INDIVIDUAL),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductDetailUpdate> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)

      const payload = request.payload as any

      const params: IIndividualProductDetailUpdateParams = {
        basic: null,
        brandId: null,
        productsRelationId: null,
        sku: null,
        tags: null,
        attributes: null,
        featureSections: null,
      }

      if (payload.basic) {
        params.basic = {
          name: payload.basic.name,
          shortName: payload.basic.shortName,
          position: payload.basic.position,
          isActive: payload.basic.isActive,
          description: payload.basic.description,
          seo: {
            title: payload.basic.seo.title,
            description: payload.basic.seo.description,
            keywords: payload.basic.seo.keywords,
          },
          catalogueId: payload.basic.catalogueId,
          imageIds: payload.basic.imageIds,
        }
      }

      if (payload.brandId) {
        params.brandId = payload.brandId
      }
      if (payload.productsRelationId) {
        params.productsRelationId = payload.productsRelationId
      }
      if (payload.sku) {
        params.sku = payload.sku
      }
      if (payload.tags) {
        params.tags = payload.tags
      }
      if (payload.attributes) {
        params.attributes = payload.attributes
      }
      if (payload.featureSections) {
        params.featureSections = payload.featureSections
      }

      const productDetail = await productService.updateIndividualProductDetail(request.params.productId, params)
      return productDetail
    },
  })

  server.route({
    method: 'delete',
    path: '/individual/detail/{productId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().required(),
        }),
        payload: getProductDeletePayload(ProductType.INDIVIDUAL),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductDetailDelete> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)

      const payload = request.payload as any

      const params: IIndividualProductDetailDeleteParams = {
        tags: payload.tags || null,
        attributes: payload.attributes || null,
        featureSections: payload.featureSections || null,
      }

      const productDetail = await productService.deleteIndividualProductDetail(request.params.productId, params)
      return productDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/individual/info/search/{query}',
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
    handler: async (request: Hapi.Request): Promise<IIndividualProductInfo[]> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const productInfos = await productService.getAllIndividualProductInfosByQuery(request.params.query, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return productInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/catalogue/{catalogueId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          catalogueId: Joi.number().required(),
        }),
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IIndividualProductInfo[]> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const catalogueProductInfo = await productService.getIndividualProductInfosByCatalogueId(
        request.params.catalogueId,
        { offset: request.query.offset, limit: request.query.limit }
      )
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return catalogueProductInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/combo/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IComboProductInfo[]> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const allComboProductInfos = await productService.getAllComboProductInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return allComboProductInfos
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/combo/info/{id}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IComboProductInfo> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const comboProductInfo = await productService.getComboProductInfo(request.params.id)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return comboProductInfo
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/combo/detail/{id}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          id: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IComboProductDetail> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const comboProductDetail = await productService.getComboProductDetail(request.params.id)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return comboProductDetail
    },
  })

  server.route({
    method: 'post',
    path: '/combo/detail/{productId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().optional(),
        }),
        payload: getProductUpdatePayload(ProductType.COMBO),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request): Promise<IComboProductDetailUpdate> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)

      const payload = request.payload as any

      const params: IComboProductDetailUpdateParams = {
        basic: null,
        productsRelationId: null,
        sku: null,
        tags: null,
        attributes: null,
        featureSections: null,
      }

      if (payload.basic) {
        params.basic = {
          name: payload.basic.name,
          shortName: payload.basic.shortName,
          position: payload.basic.position,
          isActive: payload.basic.isActive,
          description: payload.basic.description,
          seo: {
            title: payload.basic.seo.title,
            description: payload.basic.seo.description,
            keywords: payload.basic.seo.keywords,
          },
          imageIds: payload.basic.imageIds,
        }
      }

      if (payload.productsRelationId) {
        params.productsRelationId = payload.productsRelationId
      }
      if (payload.sku) {
        params.sku = payload.sku
      }
      if (payload.tags) {
        params.tags = payload.tags
      }
      if (payload.attributes) {
        params.attributes = payload.attributes
      }
      if (payload.featureSections) {
        params.featureSections = payload.featureSections
      }

      const productDetail = await productService.updateComboProductDetail(request.params.productId, params)
      return productDetail
    },
  })

  server.route({
    method: 'delete',
    path: '/combo/detail/{productId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          productId: Joi.number().required(),
        }),
        payload: getProductDeletePayload(ProductType.INDIVIDUAL),
        headers: Joi.object({
          [VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]: Joi.string().required(),
        }),
        options: {
          allowUnknown: true,
        },
      },
      pre: [{ method: withAdminToken }],
    },
    handler: async (request: Hapi.Request): Promise<IComboProductDetailDelete> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)

      const payload = request.payload as any

      const params: IComboProductDetailDeleteParams = {
        tags: payload.tags || null,
        attributes: payload.attributes || null,
        featureSections: payload.featureSections || null,
      }

      const productDetail = await productService.deleteComboProductDetail(request.params.productId, params)
      return productDetail
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/combo/info/search/{query}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          query: Joi.string().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<IComboProductInfo[]> => {
      const productService = appContainer.get<IProductService>(AppTypes.ProductService)
      const allComboProductInfos = await productService.getAllComboProductInfosByQuery(request.params.query, {})
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return allComboProductInfos
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'productController',
    version: '1.0.0',
  }
}
