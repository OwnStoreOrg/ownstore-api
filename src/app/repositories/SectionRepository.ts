import { EntityRepository, Repository, FindManyOptions } from 'typeorm'
import Section from '../models/SectionModel'
import { IFindCommand } from './commands/common'
import { ISectionInfoUpdateCommand } from './commands/section'

@EntityRepository(Section)
export default class SectionRepository extends Repository<Section> {
  public async getBulk(ids: number[]): Promise<Record<number, Section>> {
    const result: Record<number, Section> = {}

    const _findOptions: FindManyOptions<Section> = {
      relations: [],
    }

    const sections = await this.findByIds(ids, _findOptions)

    sections.forEach(section => {
      result[section.id] = section
    })

    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions<Section> = {
      relations: [],
      select: ['id'],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const sections = await this.find(_findOptions)
    return sections.map(section => section.id)
  }

  public async addSection(command: ISectionInfoUpdateCommand): Promise<Section> {
    const newSection = await this.save({
      name: command.name,
      title: command.title,
      subTitle: command.subTitle,
      showMoreUrl: command.showMoreUrl,
      showDivider: command.showDivider,
      type: command.type,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newSection
  }

  public async updateSection(command: ISectionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        name: command.name,
        title: command.title,
        subTitle: command.subTitle,
        showMoreUrl: command.showMoreUrl,
        showDivider: command.showDivider,
        type: command.type,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSection(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
