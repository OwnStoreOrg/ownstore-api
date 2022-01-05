import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import { IFindCommand } from './commands/common'
import SectionBlog from '../models/SectionBlogModel'
import { IBlogSectionInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionBlog)
export default class SectionBlogRepository extends Repository<SectionBlog> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionBlog[]>> {
    const result: Record<number, SectionBlog[]> = {}

    const _findOptions: FindManyOptions<SectionBlog> = {
      relations: ['blog', 'blog.image', 'section'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const sectionBlogs = await this.find(_findOptions)

    sectionBlogs.forEach(sectionBlog => {
      const blogs = result[sectionBlog.section.id] || []
      blogs.push(sectionBlog)
      result[sectionBlog.section.id] = blogs
    })

    return result
  }

  public async addBlogSection(command: IBlogSectionInfoUpdateCommand): Promise<SectionBlog> {
    const newDeal = await this.save({
      position: command.position,
      isActive: command.isActive,
      section: command.sectionId as any,
      blog: command.blogId as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateBlogSection(command: IBlogSectionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        position: command.position,
        isActive: command.isActive,
        section: command.sectionId as any,
        blog: command.blogId as any,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteBlogSection(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
