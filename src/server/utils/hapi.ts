import Hapi, { Lifecycle, Request, ResponseToolkit, RouteOptions, RouteOptionsValidate, ServerRoute } from '@hapi/hapi'
import Joi, { ObjectSchema } from 'joi'
import { CacheControlMode, withCacheControlPromise } from '../../support/cache'

export const getRequestCacheMode = (request: Request): CacheControlMode | undefined => {
  const _cache = request.query._cache as string
  let mode: CacheControlMode | undefined = undefined
  if (_cache) {
    if (_cache.toLowerCase() === 'n' || _cache.toLowerCase() === 'no_cache') {
      mode = CacheControlMode.NO_CACHE
    }
    if (_cache.toLowerCase() === 'y' || _cache.toLowerCase() === 'cache') {
      mode = CacheControlMode.CACHE
    }
  }
  return mode
}

export const registerCacheRoute = (server: Hapi.Server, route: ServerRoute): void => {
  if (route.options) {
    const options = route.options as RouteOptions
    const validate = (options.validate || {}) as RouteOptionsValidate

    const query = validate.query as ObjectSchema
    if (query && query.append) {
      validate.query = query.append({
        _cache: Joi.string()
          .valid(...['n', 'NO_CACHE', 'y', 'CACHE'])
          .optional(),
      })
    } else {
      validate.query = Joi.object({
        _cache: Joi.string()
          .valid(...['n', 'NO_CACHE', 'y', 'CACHE'])
          .optional(),
      })
    }
  } else {
    throw new Error('registerRoute require route with options')
  }

  if (route.handler) {
    const originalHandler = route.handler as Lifecycle.Method
    route.handler = async (request: Request, h: ResponseToolkit, err?: Error): Promise<any> => {
      // appLogger.debug('request.query._cache', request.query._cache);
      return withCacheControlPromise(getRequestCacheMode(request), async () => {
        return originalHandler(request, h, err)
      })
    }
  }
  server.route(route)
}
