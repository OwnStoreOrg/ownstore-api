import { EntityRepository, Repository, FindManyOptions, ILike } from 'typeorm'
import { appLogger } from '../../logger'
import User from '../models/UserModel'
import { IFindCommand } from './commands/common'
import { IUserRegisterationCommand, IUserUpdateCommand } from './commands/user'

@EntityRepository(User)
export default class UserRepository extends Repository<User> {
  public async getBulk(ids: number[]): Promise<Record<number, User>> {
    const result: Record<number, User> = {}

    const findParams: FindManyOptions<User> = {
      relations: ['addresses'],
    }

    const users = await this.findByIds(ids, findParams)

    users.forEach(user => {
      result[user.id] = user
    })

    return result
  }

  public async getBulkIds(findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions<User> = {
      relations: [],
      select: ['id'],
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const users = await this.find(_findOptions)
    return users.map(user => user.id)
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    const user = this.findOne({ where: { email: email }, relations: ['addresses'] })
    return user
  }

  public async getBulkIdsByName(name: string, findCommand: IFindCommand): Promise<number[]> {
    const result: number[] = []

    const _findOptions: FindManyOptions<User> = {
      relations: [],
      select: ['id'],
      where: {
        name: ILike(`%${name}%`),
      },
      take: findCommand.limit,
      skip: findCommand.offset,
      order: {
        id: 'DESC',
      },
    }

    const users = await this.find(_findOptions)

    users.forEach(user => {
      result.push(user.id)
    })

    return result
  }

  public async addUser(command: IUserRegisterationCommand): Promise<User> {
    const user = await this.save({
      email: command.email,
      name: command.name,
      password: command.password,
      isActive: true,
      joinedAt: new Date(),
    })
    return user
  }

  public async updateUserInfo(command: IUserUpdateCommand): Promise<void> {
    const updateObj: any = {}

    if (command.name) {
      updateObj.name = command.name
    }
    if (command.email) {
      updateObj.email = command.email
    }
    if (command.phoneNumber) {
      updateObj.phoneNumber = command.phoneNumber
    }
    if (command.password) {
      updateObj.password = command.password
    }
    if (command.isActive !== null) {
      updateObj.isActive = command.isActive
    }

    this.update(
      {
        id: command.userId,
      },
      updateObj
    )
  }
}
