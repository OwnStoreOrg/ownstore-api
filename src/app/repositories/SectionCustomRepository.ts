import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SectionCustom from '../models/SectionCustomModel'
import { IFindCommand } from './commands/common'
import { ICustomerFeedbackInfoUpdateCommand, ICustomSectionBodyUpdateCommand } from './commands/section'

@EntityRepository(SectionCustom)
export default class SectionCustomRepository extends Repository<SectionCustom> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionCustom[]>> {
    const result: Record<number, SectionCustom[]> = {}

    const _findOptions: FindManyOptions<SectionCustom> = {
      relations: ['section'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const customSections = await this.find(_findOptions)

    customSections.forEach(customSection => {
      const allSections = result[customSection.section.id] || []
      allSections.push(customSection)
      result[customSection.section.id] = allSections
    })

    return result
  }

  public async addCustomSectionBody(command: ICustomSectionBodyUpdateCommand): Promise<SectionCustom> {
    const newDeal = await this.save({
      section: command.sectionId as any,
      customHTML: command.html,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateCustomSectionBody(command: ICustomSectionBodyUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        section: command.sectionId as any,
        customHTML: command.html,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteCustomSectionBody(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
