import { injectable } from 'inversify'
import BaseService from './BaseService'
import { IBlogService } from './interface'
import { IBlogInfo, IBlogInfoDelete, IBlogInfoUpdate, IBlogInfoUpdateParams } from '../contract/blog'
import { prepareBlogInfo } from '../transformers/blog'
import { EntityNotFoundError } from '../errors/EntityError'
import { IFindParams } from '../contract/common'
import { CacheBuild, CacheBulkBuild, CachePurge } from '../decorators/cache'
import { SERVICE_CACHE_TTL } from '../constants'

@injectable()
export default class BlogService extends BaseService implements IBlogService {
  @CacheBulkBuild('BS', [[0]], SERVICE_CACHE_TTL.LONG, 'BLIS')
  private async _prepareBlogState(blogIds: number[]): Promise<Record<number, IBlogInfo>> {
    const result: Record<number, IBlogInfo> = {}

    const blogs = await this.getBlogRepository().getBulk(blogIds, {})

    Object.entries(blogs).forEach(([blogId, blog]) => {
      result[blogId] = prepareBlogInfo(blog)
    })

    return result
  }

  public async getBlogInfo(id: number): Promise<IBlogInfo> {
    const blogs = await this._prepareBlogState([id])
    const blogInfo = blogs[id]

    if (!blogInfo) {
      throw new EntityNotFoundError('Blog Info', id)
    }

    return blogInfo
  }

  @CacheBuild(
    'BS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.LONG,
    'BLIL'
  )
  public async getAllBlogInfos(findParams: IFindParams): Promise<IBlogInfo[]> {
    const blogIds = await this.getBlogRepository().getBulkIds(findParams)

    if (!blogIds.length) {
      return []
    }

    const blogs = await this._prepareBlogState(blogIds)
    return Object.values(blogs).sort((a, b) => a.position - b.position)
  }

  public async getBlogInfoByIds(ids: number[]): Promise<Record<number, IBlogInfo>> {
    const blogs = await this._prepareBlogState(ids)
    return blogs
  }

  @CacheBuild('BS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'BIQS')
  public async getAllBlogInfosByQuery(query: string, findParams: IFindParams): Promise<IBlogInfo[]> {
    const blogIds = await this.getBlogRepository().getBulkIdsByTitle(query, findParams)

    if (!blogIds.length) {
      return []
    }

    const blogs = await this._prepareBlogState(blogIds)
    return Object.values(blogs).sort((a, b) => a.position - b.position)
  }

  public async updateBlogInfo(blogId: number | null, params: IBlogInfoUpdateParams): Promise<IBlogInfoUpdate> {
    const result: IBlogInfoUpdate = {
      success: false,
    }

    if (blogId) {
      await this.getBlogRepository().updateBlog({
        id: blogId,
        ...params,
      })
      result.success = true
    } else {
      await this.getBlogRepository().addBlog({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteBlogInfo(blogId: number): Promise<IBlogInfoDelete> {
    const result: IBlogInfoDelete = {
      success: false,
    }

    await this.getBlogRepository().deleteBlog(blogId)
    result.success = true

    return result
  }
}
