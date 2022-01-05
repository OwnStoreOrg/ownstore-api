import Hapi from '@hapi/hapi'
import appContainer from '../../app/container'
import { ISearchService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import Joi from 'joi'
import { ISearchInfo } from '../../app/contract/search'
import { setResponseTtl } from '../utils/user'
import { CONTROLLER_CACHE_TTL } from '../../app/constants'
import { registerCacheRoute } from '../utils/hapi'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/search'

  registerCacheRoute(server, {
    method: 'get',
    path: '/info/{query}',
    options: {
      tags: ['api'],
      validate: {
        params: Joi.object({
          query: Joi.string().required(),
        }),
        query: Joi.object({
          limit: Joi.number().required(),
        }),
      },
    },
    handler: async (request: Hapi.Request): Promise<ISearchInfo> => {
      const searchService = appContainer.get<ISearchService>(AppTypes.SearchService)
      const searchInfo = await searchService.getSearchInfoByQuery(request.params.query, {
        limit: request.query.limit,
      })
      setResponseTtl(request, CONTROLLER_CACHE_TTL.LONG)
      return searchInfo
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'searchController',
    version: '1.0.0',
  }
}
