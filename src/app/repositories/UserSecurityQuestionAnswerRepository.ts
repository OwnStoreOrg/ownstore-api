import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import UserSecurityQuestionAnswer from '../models/UserSecurityQuestionAnswerModel'
import { IUserUpdatePasswordHintCommand, IUserUpdateSecurityQuestionAnswerCommand } from './commands/user'

@EntityRepository(UserSecurityQuestionAnswer)
export default class UserPasswordHintRepository extends Repository<UserSecurityQuestionAnswer> {
  public async getBlukByUserId(userId: number): Promise<UserSecurityQuestionAnswer[]> {
    const findOptions: FindManyOptions<UserSecurityQuestionAnswer> = {
      select: ['securityQuestion', 'id', 'answer'],
      relations: ['user', 'securityQuestion'],
      where: {
        user: {
          id: userId,
        },
      },
    }

    const questionAnswers = await this.find(findOptions)
    return questionAnswers
  }

  public async updateSecurityAnswers(userId: number, command: IUserUpdateSecurityQuestionAnswerCommand): Promise<void> {
    await this.delete({
      user: userId as any,
    })

    await this.insert(
      command.securityAnswers.map(ans => {
        return {
          answer: ans.answer,
          securityQuestion: ans.questionId as any,
          user: userId as any,
        }
      })
    )
  }
}
