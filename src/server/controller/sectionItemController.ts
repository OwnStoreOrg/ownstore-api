import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ISectionItemService, ISectionService } from '../../app/services/interface'
import {
  IBlogSectionInfoDelete,
  IBlogSectionInfoUpdate,
  ICatalogueSectionInfoDelete,
  ICatalogueSectionInfoUpdate,
  ICustomerFeedbackInfoDelete,
  ICustomerFeedbackInfoUpdate,
  ICustomSectionBodyDelete,
  ICustomSectionBodyUpdate,
  IProcedureInfoDelete,
  IProcedureInfoUpdate,
  IProductSectionInfoDelete,
  IProductSectionInfoUpdate,
  ISectionInfoDelete,
  ISlideInfoDelete,
  ISlideInfoUpdate,
  IUSPInfoDelete,
  IUSPInfoUpdate,
} from '../../app/contract/section'
import Joi from 'joi'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { PageSectionType, ProductType, SectionType } from '../../app/contract/constants'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/section'

  server.route({
    method: 'post',
    path: '/info/{sectionId}/product/info/{dealId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          dealId: Joi.number().optional(),
        }),
        payload: Joi.object({
          position: Joi.number().required(),
          isActive: Joi.bool().required(),
          productType: Joi.string()
            .valid(...Object.values(ProductType))
            .required(),
          productId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductSectionInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const dealInfoUpdate = await sectionElementsService.updateProductSection(
        request.params.sectionId,
        request.params.dealId || null,
        {
          position: payload.position,
          isActive: payload.isActive,
          productType: payload.productType,
          productId: payload.productId,
        }
      )
      return dealInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/product/info/{dealId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          dealId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProductSectionInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const dealInfoDelete = await sectionElementsService.deleteProductSection(
        request.params.sectionId,
        request.params.dealId
      )
      return dealInfoDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/catalogue/info/{catalogueSectionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          catalogueSectionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          position: Joi.number().required(),
          isActive: Joi.bool().required(),
          catalogueId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICatalogueSectionInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const catalogueSectionUpdate = await sectionElementsService.updateCatalogueSectionInfo(
        request.params.sectionId,
        request.params.catalogueSectionId || null,
        {
          position: payload.position,
          isActive: payload.isActive,
          catalogueId: payload.catalogueId,
        }
      )
      return catalogueSectionUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/catalogue/info/{catalogueSectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          catalogueSectionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICatalogueSectionInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const catalogueSectionDelete = await sectionElementsService.deleteCatalogueSectionInfo(
        request.params.sectionId,
        request.params.catalogueSectionId
      )
      return catalogueSectionDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/blog/info/{blogSectionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          blogSectionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          position: Joi.number().required(),
          isActive: Joi.bool().required(),
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
    handler: async (request: Hapi.Request): Promise<IBlogSectionInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const blogSectionUpdate = await sectionElementsService.updateBlogSectionInfo(
        request.params.sectionId,
        request.params.blogSectionId || null,
        {
          position: payload.position,
          isActive: payload.isActive,
          blogId: payload.blogId,
        }
      )
      return blogSectionUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/blog/info/{blogSectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          blogSectionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IBlogSectionInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const blogSectionDelete = await sectionElementsService.deleteBlogSectionInfo(
        request.params.sectionId,
        request.params.blogSectionId
      )
      return blogSectionDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/slide/info/{slideId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          slideId: Joi.number().optional(),
        }),
        payload: Joi.object({
          url: Joi.string()
            .required()
            .allow(null),
          imageId: Joi.number().required(),
          mobileImageId: Joi.number()
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
    handler: async (request: Hapi.Request): Promise<ISlideInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const slideUpdate = await sectionElementsService.updateSlideInfo(
        request.params.sectionId,
        request.params.slideId || null,
        {
          url: payload.url,
          imageId: payload.imageId,
          mobileImageId: payload.mobileImageId,
          position: payload.position,
          isActive: payload.isActive,
        }
      )
      return slideUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/slide/info/{slideId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          slideId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ISlideInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const slideDelete = await sectionElementsService.deleteSlideInfo(request.params.sectionId, request.params.slideId)
      return slideDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/usp/info/{uspId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          uspId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          url: Joi.string()
            .required()
            .allow(null),
          imageId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IUSPInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const uspUpdate = await sectionElementsService.updateUSPInfo(
        request.params.sectionId,
        request.params.uspId || null,
        {
          name: payload.name,
          url: payload.url,
          imageId: payload.imageId,
          position: payload.position,
          isActive: payload.isActive,
        }
      )
      return uspUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/usp/info/{uspId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          uspId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IUSPInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const uspDelete = await sectionElementsService.deleteSlideInfo(request.params.sectionId, request.params.uspId)
      return uspDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/procedure/info/{procedureId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          procedureId: Joi.number().optional(),
        }),
        payload: Joi.object({
          title: Joi.string().required(),
          subTitle: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<IProcedureInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const procedureUpdate = await sectionElementsService.updateProcedureInfo(
        request.params.sectionId,
        request.params.procedureId || null,
        {
          title: payload.title,
          subTitle: payload.subTitle,
          imageId: payload.imageId || null,
          position: payload.position,
          isActive: payload.isActive,
        }
      )
      return procedureUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/procedure/info/{procedureId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          procedureId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<IProcedureInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const procedureDelete = await sectionElementsService.deleteProcedureInfo(
        request.params.sectionId,
        request.params.procedureId
      )
      return procedureDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/customer-feedback/info/{feedbackId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          feedbackId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          email: Joi.string()
            .required()
            .allow(null),
          designation: Joi.string()
            .required()
            .allow(null),
          feedback: Joi.string().required(),
          imageId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICustomerFeedbackInfoUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const customerFeedbackUpdate = await sectionElementsService.updateCustomerFeedbackInfo(
        request.params.sectionId,
        request.params.feedbackId || null,
        {
          name: payload.name,
          email: payload.email || null,
          designation: payload.designation || null,
          feedback: payload.feedback,
          imageId: payload.imageId,
          position: payload.position,
          isActive: payload.isActive,
        }
      )
      return customerFeedbackUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/customer-feedback/info/{feedbackId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          feedbackId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICustomerFeedbackInfoDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const customerFeedbackDelete = await sectionElementsService.deleteCustomerFeedbackInfo(
        request.params.sectionId,
        request.params.feedbackId
      )
      return customerFeedbackDelete
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId}/custom-section/info/{customSectionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          customSectionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          html: Joi.string().required(),
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
    handler: async (request: Hapi.Request): Promise<ICustomSectionBodyUpdate> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)

      const payload = request.payload as any

      const customSectionUpdate = await sectionElementsService.updateCustomSectionBodyInfo(
        request.params.sectionId,
        request.params.customSectionId || null,
        {
          html: payload.html,
          position: payload.position,
          isActive: payload.isActive,
        }
      )
      return customSectionUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}/custom-section/info/{customSectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
          customSectionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ICustomSectionBodyDelete> => {
      const sectionElementsService = appContainer.get<ISectionItemService>(AppTypes.SectionElementsService)
      const customSectionDelete = await sectionElementsService.deleteCustomSectionBodyInfo(
        request.params.sectionId,
        request.params.customSectionId
      )
      return customSectionDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'sectionItemController',
    version: '1.0.0',
  }
}
