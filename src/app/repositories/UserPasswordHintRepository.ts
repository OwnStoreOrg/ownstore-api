import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import UserPasswordHint from '../models/UserPasswordHintModel'
import { IUserUpdatePasswordHintCommand } from './commands/user'

@EntityRepository(UserPasswordHint)
export default class UserPasswordHintRepository extends Repository<UserPasswordHint> {
  public async getHintByUserId(userId: number): Promise<string | null> {
    const findOptions: FindManyOptions<UserPasswordHint> = {
      select: ['hint', 'user'],
      relations: ['user'],
      where: {
        user: {
          id: userId,
        },
      },
    }

    const hints = await this.find(findOptions)
    const hint = hints[0]

    return hint?.hint || null
  }

  public async updateUserPasswordHint(userId: number, command: IUserUpdatePasswordHintCommand): Promise<void> {
    const count = await this.count({
      user: userId as any,
    })

    if (count > 0) {
      await this.update({ user: userId as any }, { hint: command.hint })
    } else {
      await this.save({
        hint: command.hint,
        user: userId as any,
        createdAt: new Date(),
      })
    }
  }
}
