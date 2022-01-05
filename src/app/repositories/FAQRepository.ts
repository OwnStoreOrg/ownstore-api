import { Any, EntityRepository, In, Repository } from 'typeorm'
import FAQ from '../models/FAQModel'
import { IFindCommand } from './commands/common'
import { IFAQInfoUpdateCommand } from './commands/faq'

@EntityRepository(FAQ)
export default class FAQRepository extends Repository<FAQ> {
  public async getBulk(ids: number[]): Promise<Record<number, FAQ>> {
    const result: Record<number, FAQ> = {}
    const faqs = await (ids.length === 0 ? this.find() : this.findByIds(ids))

    faqs.forEach(faq => {
      result[faq.id] = faq
    })
    return result
  }

  public async getBulkByTopicId(faqTopicIds: number[], findCommand: IFindCommand): Promise<Record<number, FAQ[]>> {
    const result: Record<number, FAQ[]> = {}

    const faqs = await this.find({
      relations: ['topic'],
      where: {
        topic: {
          id: In([...faqTopicIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    })

    faqs.forEach(faq => {
      const faqs = result[faq.topic.id] || []
      faqs.push(faq)
      result[faq.topic.id] = faqs
    })

    return result
  }

  public async addFAQ(command: IFAQInfoUpdateCommand): Promise<FAQ> {
    const newFAQ = await this.save({
      topic: command.topicId as any,
      question: command.question,
      answer: command.answer,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newFAQ
  }

  public async updateFAQ(command: IFAQInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        question: command.question,
        answer: command.answer,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteFAQ(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
