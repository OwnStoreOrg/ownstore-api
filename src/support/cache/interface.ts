export interface ICacheProvider {
  get(key: string): Promise<any>
  getBulk(keys: string[]): Promise<Record<string, any>>
  set(key: string, value: any, ttl?: number): Promise<void>
  setBulk(entries: { key: string; value: any; ttl?: number }[]): Promise<void>
  delete(key: string): Promise<void>
  deleteBulk(keys: string[]): Promise<void>
  clear(startsWith?: string): Promise<void>
}
