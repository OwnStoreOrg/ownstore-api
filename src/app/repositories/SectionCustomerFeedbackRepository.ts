import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SectionCustomerFeedback from '../models/SectionCustomerFeedbackModel'
import { IFindCommand } from './commands/common'
import { ICustomerFeedbackInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionCustomerFeedback)
export default class CustomerFeedbackRepository extends Repository<SectionCustomerFeedback> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionCustomerFeedback[]>> {
    const result: Record<number, SectionCustomerFeedback[]> = {}

    const _findOptions: FindManyOptions<SectionCustomerFeedback> = {
      relations: ['section', 'image'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const customerFeedbacks = await this.find(_findOptions)

    customerFeedbacks.forEach(customerFeedback => {
      const allFeedbacks = result[customerFeedback.section.id] || []
      allFeedbacks.push(customerFeedback)
      result[customerFeedback.section.id] = allFeedbacks
    })

    return result
  }

  public async addCustomerFeedback(command: ICustomerFeedbackInfoUpdateCommand): Promise<SectionCustomerFeedback> {
    const newDeal = await this.save({
      section: command.sectionId as any,
      customerName: command.name,
      customerEmail: command.email,
      customerDesignation: command.designation,
      image: command.imageId as any,
      feedback: command.feedback,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateCustomerFeedback(command: ICustomerFeedbackInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        customerName: command.name,
        customerEmail: command.email,
        customerDesignation: command.designation,
        image: command.imageId as any,
        feedback: command.feedback,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSlide(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
