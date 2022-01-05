import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SectionUSP from '../models/SectionUSPModel'
import { IFindCommand } from './commands/common'
import { IUSPInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionUSP)
export default class USPRepository extends Repository<SectionUSP> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionUSP[]>> {
    const result: Record<number, SectionUSP[]> = {}

    const _findOptions: FindManyOptions<SectionUSP> = {
      relations: ['section', 'image'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      take: findCommand.limit,
      skip: findCommand.offset,
    }

    const uspList = await this.find(_findOptions)

    uspList.forEach(usp => {
      const usps = result[usp.section.id] || []
      usps.push(usp)
      result[usp.section.id] = usps
    })

    return result
  }

  public async addUSP(command: IUSPInfoUpdateCommand): Promise<SectionUSP> {
    const newDeal = await this.save({
      section: command.sectionId as any,
      name: command.name,
      url: command.url,
      image: command.imageId as any,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateUSP(command: IUSPInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        section: command.sectionId as any,
        name: command.name,
        url: command.url,
        image: command.imageId as any,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteUSP(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
