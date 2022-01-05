import { EntityRepository, FindManyOptions, Repository } from 'typeorm'
import UserLoginHistory from '../models/UserLoginHistoryModel'
import { IFindCommand } from './commands/common'
import { IUserLoginAttributesAddCommand } from './commands/user'

@EntityRepository(UserLoginHistory)
export default class UserLoginHistoryRepository extends Repository<UserLoginHistory> {
  public async getBulkByUserId(userId: number, findCommand: IFindCommand): Promise<UserLoginHistory[]> {
    const _findOptions: FindManyOptions<UserLoginHistory> = {
      relations: ['user'],
      where: {
        user: {
          id: userId,
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
      order: {
        id: 'DESC',
      },
    }

    const history = await this.find(_findOptions)
    return history
  }

  public async add(userId: number, params: IUserLoginAttributesAddCommand) {
    const newHistory = await this.save({
      user: userId as any,
      userAgent: params.userAgent,
      dimension: `${params.dimension.width}x${params.dimension.height}`,
      loginType: params.loginType,
      loginSource: params.loginSource,
      platform: params.platform,
      url: params.url,
      ipAddress: params.ipAddress,
      sessionExpiry: params.sessionExpiry,
      createdAt: new Date(),
      networkType: params.networkInformation?.type,
      networkEffectiveType: params.networkInformation?.effectiveType,
    })
    return newHistory
  }
}
