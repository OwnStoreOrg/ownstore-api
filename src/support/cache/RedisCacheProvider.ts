import { ICacheProvider } from './interface'
import Redis, { Cluster } from 'ioredis'
import { promisify } from 'util'
import { brotliCompress, constants, brotliDecompress } from 'zlib'

const brotliCompressAsync = promisify(brotliCompress)
const brotliDecompressAsync = promisify(brotliDecompress)

export interface RedisConf {
  enabled: boolean
  url: string
  host: string
  port: number
  dbIndex: string
  mode: string // cluster' | 'standalone';
  password: string
  keyPrefix: string
}

export default class RedisCacheProvider implements ICacheProvider {
  private deaultTtl: number

  private maxTtl: number

  private isCluster: boolean

  private client: Redis.Cluster | Redis.Redis

  private enabled: boolean

  private keyPrefix: string

  public constructor(conf: RedisConf, deaultTtl: number, maxTtl: number) {
    this.deaultTtl = deaultTtl
    this.maxTtl = maxTtl
    this.isCluster = conf.mode === 'cluster'
    this.enabled = conf.enabled
    this.keyPrefix = conf.keyPrefix

    if (this.isCluster) {
      this.client = new Cluster(
        [
          {
            host: conf.host,
            port: conf.port,
          },
        ],
        {
          scaleReads: 'slave',
          redisOptions: {
            password: conf.password,
          },
        }
      )
    } else {
      if (conf.url) {
        this.client = new Redis(conf.url)
      } else {
        this.client = new Redis({
          host: conf.host,
          port: conf.port,
          password: conf.password,
          db: Number(conf.dbIndex),
        })
      }
    }
  }

  private prepareKey(key: string): string {
    return this.keyPrefix + ':' + key
  }

  public async get(key: string): Promise<any> {
    if (!this.enabled) {
      return Promise.resolve(undefined)
    }

    const finalKey = this.prepareKey(key)
    let value: string | null = null
    if (this.isCluster) {
      value = await (this.client as Redis.Cluster).get(finalKey)
    } else {
      value = await (this.client as Redis.Redis).get(finalKey)
    }
    return value && JSON.parse((await brotliDecompressAsync(Buffer.from(value, 'base64'))).toString())
  }

  public async getBulk(keys: string[]): Promise<Record<string, any>> {
    if (!this.enabled) {
      return Promise.resolve({})
    }

    const finalKeys = keys.map(key => this.prepareKey(key))

    const result = {}
    if (this.isCluster) {
      const promises: Promise<string | null>[] = []
      finalKeys.forEach(key => {
        promises.push((this.client as Redis.Cluster).get(key))
      })
      const promiseResults = await Promise.all(promises)
      const decompressedValuepromises = finalKeys.map(async (finalKey, index) => {
        const value = promiseResults[index]
        const valueObj = value && JSON.parse((await brotliDecompressAsync(Buffer.from(value, 'base64'))).toString())
        result[keys[index]] = valueObj
      })

      await Promise.all(decompressedValuepromises)

      return result
    } else {
      const pipeline = (this.client as Redis.Redis).multi()
      finalKeys.forEach(key => {
        pipeline.get(key)
      })
      const pipelineResult = await pipeline.exec()

      const decompressedValuepromises = finalKeys.map(async (finalKey, index) => {
        const value = pipelineResult[index][1]
        const valueObj = value && JSON.parse((await brotliDecompressAsync(Buffer.from(value, 'base64'))).toString())
        result[keys[index]] = valueObj
      })
      await Promise.all(decompressedValuepromises)
    }
    return result
  }

  public async set(key: string, value: any, ttl?: number): Promise<any> {
    if (!this.enabled || value === null || value === undefined || ttl === 0) {
      return Promise.resolve(undefined)
    }

    const finalKey = this.prepareKey(key)

    const jsonValue = JSON.stringify(value)
    const compressedValue = (
      await brotliCompressAsync(jsonValue, {
        params: {
          [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          [constants.BROTLI_PARAM_QUALITY]: 4,
        },
      })
    ).toString('base64')

    let finalTtl = ttl || this.deaultTtl
    if (finalTtl > this.maxTtl) {
      finalTtl = this.maxTtl
    }
    finalTtl = Math.round(finalTtl)

    if (this.isCluster) {
      return (this.client as Redis.Cluster).set(finalKey, compressedValue, 'EX', finalTtl)
    } else {
      return (this.client as Redis.Redis).set(finalKey, compressedValue, 'EX', finalTtl)
    }
  }

  public async setBulk(entries: { key: string; value: any; ttl?: number }[]): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve(undefined)
    }

    if (this.isCluster) {
      const promises: Promise<string | null>[] = entries.map(async entry => {
        if (entry.ttl === 0) {
          return null
        }
        const jsonValue = JSON.stringify(entry.value)
        const compressedValue = (
          await brotliCompressAsync(jsonValue, {
            params: {
              [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
              [constants.BROTLI_PARAM_QUALITY]: 4,
            },
          })
        ).toString('base64')

        let finalTtl = entry.ttl || this.deaultTtl
        if (finalTtl > this.maxTtl) {
          finalTtl = this.maxTtl
        }
        finalTtl = Math.round(finalTtl)

        const finalKey = this.prepareKey(entry.key)
        return (this.client as Redis.Cluster).set(finalKey, compressedValue, 'EX', finalTtl)
      })

      await Promise.all(promises)
    } else {
      const pipeline = (this.client as Redis.Redis).multi()
      const promises = entries.map(async entry => {
        if (entry.ttl === 0) {
          return
        }
        const jsonValue = JSON.stringify(entry.value)
        const compressedValue = (
          await brotliCompressAsync(jsonValue, {
            params: {
              [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
              [constants.BROTLI_PARAM_QUALITY]: 4,
            },
          })
        ).toString('base64')

        let finalTtl = entry.ttl || this.deaultTtl
        if (finalTtl > this.maxTtl) {
          finalTtl = this.maxTtl
        }
        finalTtl = Math.round(finalTtl)

        const finalKey = this.prepareKey(entry.key)
        pipeline.set(finalKey, compressedValue, 'EX', finalTtl)
      })
      await Promise.all(promises)
      await pipeline.exec()
    }
    return
  }

  public async delete(key: string): Promise<void> {
    this.deleteBulk([key])
  }

  private async deleteInternal(redis: Redis.Redis, keys: string[]): Promise<any> {
    const pipeline = redis.pipeline()
    keys.forEach(key => {
      pipeline.del(this.prepareKey(key))
    })
    await pipeline.exec()
    return
  }

  public async deleteBulk(keys: string[]): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve(undefined)
    }
    if (this.isCluster) {
      const cluster = this.client as Redis.Cluster
      const clutserPromises: Promise<any>[] = []
      cluster.nodes('master').forEach(node => {
        clutserPromises.push(this.deleteInternal(node, keys))
      })
      await Promise.all(clutserPromises)
    } else {
      const redis = this.client as Redis.Redis
      await this.deleteInternal(redis, keys)
    }
    return
  }

  private async clearInternal(redis: Redis.Redis, startsWith?: string): Promise<void> {
    const resultPromise = new Promise<void>((resolve, reject) => {
      const stream = redis.scanStream({
        match: this.keyPrefix + `:${startsWith || ''}*`,
        count: 100,
      })
      stream.on('data', keys => {
        const matchingKeys = keys as string[]
        const pipeline = redis.pipeline()
        matchingKeys.forEach(matchingKey => {
          pipeline.del(matchingKey)
        })
        pipeline.exec()
      })
      stream.on('end', () => {
        resolve()
      })
      stream.on('error', err => {
        reject(err)
      })
    })
    return resultPromise
  }

  public async clear(startsWith?: string): Promise<void> {
    if (!this.enabled) {
      return Promise.resolve(undefined)
    }

    if (this.isCluster) {
      const cluster = this.client as Redis.Cluster
      const clutserPromises: Promise<any>[] = []
      cluster.nodes('master').forEach(node => {
        clutserPromises.push(this.clearInternal(node, startsWith))
      })
      await Promise.all(clutserPromises)
    } else {
      const redis = this.client as Redis.Redis
      await this.clearInternal(redis, startsWith)
    }
    return
  }
}
