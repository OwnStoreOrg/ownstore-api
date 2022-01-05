import AppTypes from '../AppTypes'
import R from 'ramda'
import appContainer from '../container'
import { ICacheProvider } from '../../support/cache/interface'
import appConfig from '../../appConfig'
import { CacheControlMode, getCacheControlMode } from '../../support/cache'

export type TTLHandler = (args: any, item: any) => number

export const isCacheEnabled = () => {
  if (!appConfig.cache.redis.enabled) {
    return false
  }

  const mode = getCacheControlMode()

  if (mode === CacheControlMode.NO_CACHE) {
    return false
  }

  return true
}

export const generateCacheKey = (
  namespace: string,
  params: [number, string?][],
  prefix: string,
  args: IArguments
): string => {
  // namespace:prefix:param1+param2
  const paramValues = params
    .map((item): string => {
      const index = item[0]
      const path = item.length > 1 ? item[1] : undefined

      let value = args[index]

      if (path) {
        value = R.path(path.split('.'), value)
      }
      return value ? value.toString() : ''
    })
    .join('+')

  const key = `${namespace}:${prefix}:${paramValues}`
  return key
}

export const CacheBuild = (
  namespace: string,
  params: [number, string?][],
  ttl?: number | TTLHandler,
  prefix: string = ''
): MethodDecorator => {
  return function(target: Record<string, any>, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value

    descriptor.value = async function(...args: any) {
      if (isCacheEnabled()) {
        const key = generateCacheKey(namespace, params, prefix, args)

        const cacheProvider = appContainer.get<ICacheProvider>(AppTypes.CacheProvider)
        let result = await cacheProvider.get(key)

        if (result) {
          return result
        }

        result = await Promise.resolve(oldMethod.apply(this, args))
        if (result) {
          await cacheProvider.set(key, result, typeof ttl === 'function' ? ttl(args, result) : ttl)
        }
        return result
      } else {
        return await Promise.resolve(oldMethod.apply(this, args))
      }
    }
  }
}

export const CacheBulkBuild = (
  namespace: string,
  params: [number, string?][],
  ttl?: number | TTLHandler,
  prefix: string = ''
): MethodDecorator => {
  return function(target: Record<string, any>, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value

    descriptor.value = async function(...args: any) {
      const otherArgs = args.length > 1 ? args.slice(0, args.length - 1) : []
      let repeatedArg = args[args.length - 1]

      if (!Array.isArray(repeatedArg)) {
        throw new Error('CacheBulkBuild last params must be an Array.')
      }

      repeatedArg = R.uniq(repeatedArg)

      const enabled = isCacheEnabled()
      if (enabled) {
        const keys: string[] = []
        const keyArg: Record<string, any> = {}
        const argKey: Record<any, string> = {}
        for (const arg of repeatedArg) {
          const methodArgs = [...otherArgs]
          methodArgs.push(arg)
          const key = generateCacheKey(namespace, params, prefix, methodArgs as any)
          keys.push(key)
          keyArg[key] = arg
          argKey[arg] = key
        }

        const cacheProvider = appContainer.get<ICacheProvider>(AppTypes.CacheProvider)

        const finalResult: Record<string, any> = {}
        const pendingArgs: any[] = []

        const bulkResult = await cacheProvider.getBulk(keys)
        Object.keys(bulkResult).forEach(key => {
          const value = bulkResult[key]
          if (value === undefined || value === null) {
            pendingArgs.push(keyArg[key])
          } else {
            finalResult[keyArg[key]] = value
          }
        })

        if (pendingArgs.length > 0) {
          const methodArgs = [...otherArgs]
          methodArgs.push(pendingArgs)
          const updateEntries: { key: string; value: any; ttl?: number }[] = []
          const methodResult: Record<any, any> = await Promise.resolve(oldMethod.apply(this, methodArgs))

          Object.keys(methodResult).forEach(arg => {
            const value = methodResult[arg]
            finalResult[arg] = value
            if (value) {
              updateEntries.push({
                key: argKey[arg],
                value: value,
                ttl: typeof ttl === 'function' ? ttl(methodArgs, value) : ttl,
              })
            }
          })
          if (updateEntries.length > 0) {
            await cacheProvider.setBulk(updateEntries)
          }
        }
        return finalResult
      } else {
        return await Promise.resolve(oldMethod.apply(this, [...otherArgs, repeatedArg]))
      }
    }
  }
}

export const CachePurge = (
  namespace: string,
  params: [number, string?][],
  prefix: string = '',
  wildcard: boolean = false
): MethodDecorator => {
  return function(target: Record<string, any>, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value

    descriptor.value = async function(...args: any) {
      if (isCacheEnabled()) {
        const key = generateCacheKey(namespace, params, prefix, args)
        const cacheProvider = appContainer.get<ICacheProvider>(AppTypes.CacheProvider)
        const result = await Promise.resolve(oldMethod.apply(this, args))
        if (wildcard) {
          await cacheProvider.clear(`${key}+`)
        } else {
          await cacheProvider.delete(key)
        }
        return result
      } else {
        return await Promise.resolve(oldMethod.apply(this, args))
      }
    }
  }
}

export const CacheBulkPurge = (
  namespace: string,
  params: [number, string?][],
  prefix: string = '',
  wildcard: boolean = false
): MethodDecorator => {
  return function(target: Record<string, any>, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const oldMethod = descriptor.value

    descriptor.value = async function(...args: any) {
      const otherArgs = args.length > 1 ? args.slice(0, args.length - 1) : []
      let repeatedArg = args[args.length - 1]

      if (!Array.isArray(repeatedArg)) {
        throw new Error('CacheBulkPurge last params must be an Array.')
      }

      repeatedArg = R.uniq(repeatedArg)

      const enabled = isCacheEnabled()
      if (enabled) {
        const keys: string[] = []
        for (const arg of repeatedArg) {
          const methodArgs = [...otherArgs]
          methodArgs.push(arg)
          const key = generateCacheKey(namespace, params, prefix, methodArgs as any)
          keys.push(key)
        }

        const cacheProvider = appContainer.get<ICacheProvider>(AppTypes.CacheProvider)

        // call the original method
        const methodResult: any = await Promise.resolve(oldMethod.apply(this, [...otherArgs, repeatedArg]))
        if (wildcard) {
          await Promise.all(keys.map(key => cacheProvider.clear(`${key}+`)))
        } else {
          await cacheProvider.deleteBulk(keys)
        }

        return methodResult
      } else {
        return await Promise.resolve(oldMethod.apply(this, [...otherArgs, repeatedArg]))
      }
    }
  }
}
