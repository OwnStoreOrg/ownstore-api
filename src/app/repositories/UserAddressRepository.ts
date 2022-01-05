import { EntityRepository, FindManyOptions, In, Repository } from 'typeorm'
import UserAddress from '../models/UserAddressModel'
import { IFindCommand } from './commands/common'
import { IUserAddressUpdateCommand } from './commands/user'

@EntityRepository(UserAddress)
export default class UserAddressRepository extends Repository<UserAddress> {
  public async getBulk(addressIds: number[]): Promise<Record<number, UserAddress>> {
    const result: Record<number, UserAddress> = {}

    const _findOptions: FindManyOptions<UserAddress> = {
      relations: [],
      where: {
        id: In([...addressIds]),
      },
    }

    const userAddresses = await this.find(_findOptions)

    userAddresses.forEach(address => {
      result[address.id] = address
    })

    return result
  }

  public async getBulkIdsByUserId(userId: number, findCommand: IFindCommand): Promise<number[]> {
    const _findOptions: FindManyOptions<UserAddress> = {
      relations: ['user'],
      select: ['id', 'user'],
      skip: findCommand.offset,
      take: findCommand.limit,
      order: {
        id: 'DESC',
      },
      where: {
        user: {
          id: userId,
        },
      },
    }

    const addressList = await this.find(_findOptions)

    return addressList.map(address => address.id)
  }

  public async addUserAddress(command: IUserAddressUpdateCommand): Promise<UserAddress> {
    const newUserAddress = await this.save({
      user: command.userId as any,
      name: command.name,
      phoneNumber: command.phoneNumber,
      addressLine: command.addressLine,
      area: command.area,
      areaCode: command.areaCode,
      city: command.city,
      country: command.country,
      isPrimary: command.isPrimary,
      isActive: command.isActive,
      addressType: command.addressType,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newUserAddress
  }

  public async updateUserAddress(command: IUserAddressUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.addressId as number,
        user: {
          id: command.userId,
        },
      },
      {
        name: command.name,
        phoneNumber: command.phoneNumber,
        addressLine: command.addressLine,
        area: command.area,
        areaCode: command.areaCode,
        city: command.city,
        country: command.country,
        isPrimary: command.isPrimary,
        isActive: command.isActive,
        addressType: command.addressType,
        updatedAt: new Date(),
      }
    )
  }
}
