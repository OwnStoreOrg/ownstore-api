import { AsyncLocalStorage } from 'async_hooks'

export enum CacheControlMode {
  CACHE = 'CACHE',
  NO_CACHE = 'NO_CACHE',
}

const context = new AsyncLocalStorage<Map<string, CacheControlMode | undefined>>()

export const withCacheControlPromise = <T>(
  mode: CacheControlMode | undefined,
  callback: () => Promise<T>
): Promise<T> => {
  if (mode) {
    const store = new Map()
    const result = context.run(store, async () => {
      store.set('mode', mode)
      return Promise.resolve(callback()).finally(() => {
        store.set('mode', undefined)
      })
    })
    return result
  }
  return callback()
}

export const getCacheControlMode = (): CacheControlMode | undefined => {
  const store = context.getStore()
  return store ? store.get('mode') : undefined
}
