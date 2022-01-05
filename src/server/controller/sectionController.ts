import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import AppTypes from '../../app/AppTypes'
import { ISectionItemService, ISectionService } from '../../app/services/interface'
import { ISectionInfo, ISectionInfoDelete, ISectionInfoUpdate } from '../../app/contract/section'
import Joi from 'joi'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL, VALID_EXTERNAL_HEADERS } from '../../app/constants'
import { withAdminToken } from '../utils/admin'
import { PageSectionType, ProductType, SectionType } from '../../app/contract/constants'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/section'

  registerCacheRoute(server, {
    method: 'get',
    path: '/info',
    options: {
      tags: ['api'],
      validate: {
        query: Joi.object({
          offset: Joi.number().optional(),
          limit: Joi.number().optional(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISectionInfo[]> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const allSections = await sectionService.getAllSectionInfos({
        offset: request.query.offset,
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return allSections
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{sectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.string().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISectionInfo> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const section = await sectionService.getSectionInfoById(request.params.sectionId)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return section
    },
  })

  server.route({
    method: 'post',
    path: '/info/{sectionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          name: Joi.string().required(),
          title: Joi.string()
            .required()
            .allow(null),
          subTitle: Joi.string()
            .required()
            .allow(null),
          showMoreUrl: Joi.string()
            .required()
            .allow(null),
          showDivider: Joi.boolean()
            .required()
            .allow(null),
          type: Joi.string()
            .valid(...Object.values(SectionType))
            .required(),
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
    handler: async (request: Hapi.Request): Promise<ISectionInfoUpdate> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)

      const payload = request.payload as any

      const sectionInfoUpdate = await sectionService.updateSectionInfo(request.params.sectionId || null, {
        name: payload.name,
        title: payload.title,
        subTitle: payload.subTitle,
        showMoreUrl: payload.showMoreUrl,
        showDivider: payload.showDivider,
        type: payload.type,
      })
      return sectionInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/info/{sectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          sectionId: Joi.number().required(),
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
    handler: async (request: Hapi.Request): Promise<ISectionInfoDelete> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const sectionInfoDelete = await sectionService.deleteSectionInfo(request.params.sectionId)
      return sectionInfoDelete
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/page/{pageSectionType}/info',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          pageSectionType: Joi.string()
            .required()
            .valid(...Object.values(PageSectionType)),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISectionInfo[]> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const searchSections = await sectionService.getAllPageSections(request.params.pageSectionType)
      setResponseTtl(request, CONTROLLER_CACHE_TTL.DEFAULT)
      return searchSections
    },
  })

  registerCacheRoute(server, {
    method: 'get',
    path: '/page/{pageSectionType}/info/{pageSectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          pageSectionType: Joi.string()
            .required()
            .valid(...Object.values(PageSectionType)),
          pageSectionId: Joi.string().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISectionInfo> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const section = await sectionService.getPageSectionInfoById(
        request.params.pageSectionId,
        request.params.pageSectionType
      )
      return section
    },
  })

  server.route({
    method: 'post',
    path: '/page/{pageSectionType}/info/{pageSectionId?}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          pageSectionType: Joi.string()
            .required()
            .valid(...Object.values(PageSectionType)),
          pageSectionId: Joi.number().optional(),
        }),
        payload: Joi.object({
          sectionId: Joi.number().required(),
          position: Joi.number().required(),
          title: Joi.string()
            .required()
            .allow(null),
          subTitle: Joi.string()
            .required()
            .allow(null),
          showMoreUrl: Joi.string()
            .required()
            .allow(null),
          showDivider: Joi.boolean()
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
    handler: async (request: Hapi.Request): Promise<ISectionInfoUpdate> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)

      const payload = request.payload as any

      const sectionInfoUpdate = await sectionService.updatePageSectionInfo(
        request.params.pageSectionId || null,
        request.params.pageSectionType,
        {
          sectionId: payload.sectionId,
          position: payload.position,
          title: payload.title,
          subTitle: payload.subTitle,
          showMoreUrl: payload.showMoreUrl,
          showDivider: payload.showDivider,
        }
      )
      return sectionInfoUpdate
    },
  })

  server.route({
    method: 'delete',
    path: '/page/{pageSectionType}/info/{pageSectionId}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          pageSectionId: Joi.number().required(),
          pageSectionType: Joi.string()
            .required()
            .valid(...Object.values(PageSectionType)),
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
    handler: async (request: Hapi.Request): Promise<ISectionInfoDelete> => {
      const sectionService = appContainer.get<ISectionService>(AppTypes.SectionService)
      const sectionInfoDelete = await sectionService.deletePageSectionInfo(
        request.params.pageSectionId,
        request.params.pageSectionType
      )
      return sectionInfoDelete
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'sectionController',
    version: '1.0.0',
  }
}
