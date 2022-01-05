import { EntityRepository, FindManyOptions, getCustomRepository, Repository } from 'typeorm'
import UserCartItemModel from '../models/UserCartItemModel'
import { uniqueList } from '../utils/common'
import ComboRepository from './ComboProductRepository'
import {
  ICartAddCommand,
  ICartDeleteCommand,
  ICartUpdateByIdCommand,
  ICartUpdateByProductCommand,
} from './commands/cart'
import IndividualProductRepository from './IndividualProductRepository'

@EntityRepository(UserCartItemModel)
export default class UserCartItemRepository extends Repository<UserCartItemModel> {
  private individualProductRepository = getCustomRepository(IndividualProductRepository)

  private comboProductRepository = getCustomRepository(ComboRepository)

  public async getBulkByUser(userId: number): Promise<UserCartItemModel[]> {
    const _findOptions: FindManyOptions<UserCartItemModel> = {
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
      where: {
        user: {
          id: userId,
        },
      },
    }

    const cartItems = await this.find(_findOptions)

    const individualProductIds: number[] = []
    const comboProductIds: number[] = []

    cartItems.forEach(cartItem => {
      if (cartItem.individualProduct) {
        individualProductIds.push(cartItem.individualProduct.id)
      }
      if (cartItem.comboProduct) {
        comboProductIds.push(cartItem.comboProduct.id)
      }
    })

    const [individualProducts, comboProducts] = await Promise.all([
      this.individualProductRepository.getBulkInfo(uniqueList(individualProductIds), {}),
      this.comboProductRepository.getBulkInfo(uniqueList(comboProductIds), {}),
    ])

    return cartItems.map(cartItem => {
      return {
        ...cartItem,
        individualProduct: cartItem.individualProduct ? individualProducts[cartItem.individualProduct.id] : null,
        comboProduct: cartItem.comboProduct ? comboProducts[cartItem.comboProduct.id] : null,
      }
    })
  }

  public async getCountByUserAndProduct(
    userId: number,
    individualProductId: number | null,
    comboProductId: number | null
  ): Promise<number> {
    const _findOptions: FindManyOptions<UserCartItemModel> = {
      where: {
        user: {
          id: userId,
        },
        individualProduct: individualProductId,
        comboProduct: comboProductId,
      },
    }

    const cartItemsCount = this.count(_findOptions)
    return cartItemsCount
  }

  public async updateCartByProduct(command: ICartUpdateByProductCommand): Promise<void> {
    await this.update(
      {
        user: {
          id: command.userId,
        },
        ...(command.individualProductId ? { individualProduct: command.individualProductId as any } : null),
        ...(command.comboProductId ? { comboProduct: command.comboProductId as any } : null),
      },
      {
        quantity: command.totalQuantity,
        updatedAt: new Date(),
      }
    )
  }

  public async updateCartById(command: ICartUpdateByIdCommand): Promise<void> {
    await this.update(
      {
        user: {
          id: command.userId,
        },
        id: command.cartId,
      },
      {
        ...(command.totalQuantity && { quantity: command.totalQuantity }),
        updatedAt: new Date(),
      }
    )
  }

  public async addCart(command: ICartAddCommand): Promise<number> {
    const newUserWishId = await this.save({
      user: command.userId as any,
      individualProduct: command.individualProductId as any,
      comboProduct: command.comboProductId as any,
      quantity: command.totalQuantity,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newUserWishId.id
  }

  public async deleteCart(command: ICartDeleteCommand): Promise<void> {
    await this.delete({
      ...(command.cartId && { id: command.cartId }),
      user: {
        id: command.userId,
      },
    })
  }
}
