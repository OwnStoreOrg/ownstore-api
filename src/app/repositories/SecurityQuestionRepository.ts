import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SecurityQuestion from '../models/SecurityQuestionModel'
import { IFindCommand } from './commands/common'
import { IISecurityQuestionUpdateCommand } from './commands/security'

@EntityRepository(SecurityQuestion)
export default class SecurityQuestionRepository extends Repository<SecurityQuestion> {
  public async getBulk(questionIds: number[]): Promise<Record<number, SecurityQuestion>> {
    const result: Record<number, SecurityQuestion> = {}

    const _findOptions: FindManyOptions<SecurityQuestion> = {
      relations: [],
      where: {
        id: In([...questionIds]),
      },
    }

    const securityQuestions = await this.find(_findOptions)

    securityQuestions.forEach(securityQuestion => {
      result[securityQuestion.id] = securityQuestion
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
        id: 'ASC',
      },
    }

    const securityQuestions = await this.find(_findOptions)
    return securityQuestions.map(securityQuestion => securityQuestion.id)
  }

  public async getBluk(): Promise<SecurityQuestion[]> {
    const questions = await this.find()
    return questions
  }

  public async addSecurityQuestion(command: IISecurityQuestionUpdateCommand): Promise<SecurityQuestion> {
    const newQuestion = await this.save({
      question: command.question,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newQuestion
  }

  public async updateSecurityQuestion(command: IISecurityQuestionUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        question: command.question,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSecurityQuestion(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
