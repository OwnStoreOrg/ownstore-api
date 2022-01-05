import { EntityRepository, Repository, FindManyOptions } from 'typeorm'
import FAQTopic from '../models/FAQTopicModel'
import { IFindCommand } from './commands/common'
import { IFAQTopicInfoUpdateCommand } from './commands/faq'

@EntityRepository(FAQTopic)
export default class FAQTopicRepository extends Repository<FAQTopic> {
  public async getBulk(ids: number[], findCommand: IFindCommand): Promise<Record<number, FAQTopic>> {
    const result: Record<number, FAQTopic> = {}

    const _findOptions: FindManyOptions<FAQTopic> = {
      relations: [],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const faqTopics = await (ids.length === 0 ? this.find(_findOptions) : this.findByIds(ids, _findOptions))

    faqTopics.forEach(faqTopic => {
      result[faqTopic.id] = faqTopic
    })
    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions<FAQTopic> = {
      relations: [],
      select: ['id'],
      skip: findCommand.offset,
      take: findCommand.limit,
      order: {
        position: 'ASC',
      },
    }

    const faqTopics = await this.find(_findOptions)
    return faqTopics.map(faqTopic => faqTopic.id)
  }

  public async addFAQTopic(command: IFAQTopicInfoUpdateCommand): Promise<FAQTopic> {
    const newFAQTopic = await this.save({
      name: command.name,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newFAQTopic
  }

  public async updateFAQTopic(command: IFAQTopicInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        name: command.name,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteFAQTopic(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
