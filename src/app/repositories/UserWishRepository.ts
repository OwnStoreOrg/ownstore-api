import { EntityRepository, FindManyOptions, getCustomRepository, Repository } from 'typeorm'
import UserWish from '../models/UserWish'
import { uniqueList } from '../utils/common'
import ComboRepository from './ComboProductRepository'
import { IFindCommand } from './commands/common'
import { IUserWishAddCommand, IUserWishDeleteCommand } from './commands/userWish'
import IndividualProductRepository from './IndividualProductRepository'

@EntityRepository(UserWish)
export default class UserWishRepository extends Repository<UserWish> {
  private individualProductRepository = getCustomRepository(IndividualProductRepository)

  private comboProductRepository = getCustomRepository(ComboRepository)

  public async getBulkByUserId(userId: number, findCommand: IFindCommand): Promise<UserWish[]> {
    const _findOptions: FindManyOptions<UserWish> = {
      relations: [
        'user',
        'individualProduct',
        'individualProduct.catalogue',
        'individualProduct.sku',
        'individualProduct.sku.currency',
        'comboProduct',
        'comboProduct.sku',
        'comboProduct.sku.currency',
      ],
      skip: findCommand.offset,
      take: findCommand.limit,
      where: {
        user: {
          id: userId,
        },
      },
    }

    const userWishList = await this.find(_findOptions)

    const individualProductIds: number[] = []
    const comboProductIds: number[] = []

    userWishList.forEach(wish => {
      if (wish.individualProduct) {
        individualProductIds.push(wish.individualProduct.id)
      }
      if (wish.comboProduct) {
        comboProductIds.push(wish.comboProduct.id)
      }
    })

    const [individualProducts, comboProducts] = await Promise.all([
      this.individualProductRepository.getBulkInfo(uniqueList(individualProductIds), {}),
      this.comboProductRepository.getBulkInfo(uniqueList(comboProductIds), {}),
    ])

    return userWishList.map(wish => {
      return {
        ...wish,
        individualProduct: wish.individualProduct ? individualProducts[wish.individualProduct.id] : null,
        comboProduct: wish.comboProduct ? comboProducts[wish.comboProduct.id] : null,
      }
    })
  }

  public async addUserWish(command: IUserWishAddCommand): Promise<number> {
    const newUserWishId = await this.save({
      user: command.userId as any,
      individualProduct: command.individualProductId as any,
      comboProduct: command.comboProductId as any,
      createdAt: new Date(),
    })
    return newUserWishId.id
  }

  public async deleteUserWish(command: IUserWishDeleteCommand): Promise<void> {
    await this.delete({
      id: command.userWishId,
      user: {
        id: command.userId,
      },
    })
  }
}
