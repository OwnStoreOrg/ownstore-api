import { EntityRepository, FindManyOptions, In, Repository } from 'typeorm'
import Currency from '../models/CurrencyModel'
import { IFindCommand } from './commands/common'
import { ICurrencyInfoUpdateCommand } from './commands/currency'

@EntityRepository(Currency)
export default class CurrencyRepository extends Repository<Currency> {
  public async getBulk(currencyIds: number[]): Promise<Record<number, Currency>> {
    const result: Record<number, Currency> = {}

    const _findOptions: FindManyOptions<Currency> = {
      relations: [],
      where: {
        id: In([...currencyIds]),
      },
    }

    const currencies = await this.find(_findOptions)

    currencies.forEach(currency => {
      result[currency.id] = currency
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

    const currencies = await this.find(_findOptions)
    return currencies.map(blog => blog.id)
  }

  public async addCurrency(command: ICurrencyInfoUpdateCommand): Promise<Currency> {
    const newCurrency = await this.save({
      name: command.name,
      isoCode: command.isoCode,
      symbol: command.symbol,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newCurrency
  }

  public async updateCurrency(command: ICurrencyInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.currencyId as number,
      },
      {
        name: command.name,
        isoCode: command.isoCode,
        symbol: command.symbol,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteCurrency(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
