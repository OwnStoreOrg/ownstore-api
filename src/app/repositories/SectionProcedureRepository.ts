import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SectionProcedure from '../models/SectionProcedureModel'
import { IFindCommand } from './commands/common'
import { IProcedureInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionProcedure)
export default class ProcedureRepository extends Repository<SectionProcedure> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionProcedure[]>> {
    const result: Record<number, SectionProcedure[]> = {}

    const _findOptions: FindManyOptions<SectionProcedure> = {
      relations: ['section', 'image'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const procedures = await this.find(_findOptions)

    procedures.forEach(slide => {
      const allProcedures = result[slide.section.id] || []
      allProcedures.push(slide)
      result[slide.section.id] = allProcedures
    })

    return result
  }

  public async addProcedure(command: IProcedureInfoUpdateCommand): Promise<SectionProcedure> {
    const newDeal = await this.save({
      section: command.sectionId as any,
      title: command.title,
      subTitle: command.subTitle,
      image: command.imageId as any,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateProcedure(command: IProcedureInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        section: command.sectionId as any,
        title: command.title,
        subTitle: command.subTitle,
        image: command.imageId as any,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteProcedure(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
