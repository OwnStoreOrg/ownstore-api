import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm'
import Blog from '../models/BlogModel'
import { IBlogInfoUpdateCommand } from './commands/blog'
import { IFindCommand } from './commands/common'

@EntityRepository(Blog)
export default class BlogRepository extends Repository<Blog> {
  public async getBulk(ids: number[], findCommand: IFindCommand): Promise<Record<number, Blog>> {
    const result: Record<number, Blog> = {}

    const _findOptions: FindManyOptions = {
      relations: ['image'],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const blogs = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    blogs.forEach(blog => {
      result[blog.id] = blog
    })
    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
      select: ['id'],
      order: {
        position: 'ASC',
      },
    }

    const blogs = await this.find(_findOptions)
    return blogs.map(blog => blog.id)
  }

  public async getBulkIdsByTitle(title: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<Blog> = {
      relations: ['image'],
      select: ['id'],
      where: {
        title: ILike(`%${title}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const blogs = await this.find(_findOptions)

    blogs.forEach(blog => {
      result.push(blog.id)
    })

    return result
  }

  public async addBlog(command: IBlogInfoUpdateCommand): Promise<Blog> {
    const newBlog = await this.save({
      title: command.title,
      description: command.description,
      url: command.url,
      image: command.imageId as any,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newBlog
  }

  public async updateBlog(command: IBlogInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        title: command.title,
        description: command.description,
        url: command.url,
        image: command.imageId as any,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteBlog(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
