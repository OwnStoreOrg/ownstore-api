import { EntityRepository, Repository } from 'typeorm'
import SupportedCountry from '../models/SupportedCountryModel'
import { ISupportedRegionInfoUpdateCommand } from './commands/supportedRegions'

@EntityRepository(SupportedCountry)
export default class SupportedCountryRepository extends Repository<SupportedCountry> {
  public async getBulk(ids: number[]): Promise<Record<number, SupportedCountry>> {
    const result: Record<number, SupportedCountry> = {}
    const supportedCountries = await (ids.length === 0 ? this.find() : this.findByIds(ids))

    supportedCountries.forEach(supportedCountry => {
      result[supportedCountry.id] = supportedCountry
    })
    return result
  }

  public async addSupportedCountry(command: ISupportedRegionInfoUpdateCommand): Promise<SupportedCountry> {
    const newSupportedCountry = await this.save({
      name: command.name,
      threeLetterName: command.shortName,
      flagUrl: command.flagUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newSupportedCountry
  }

  public async updateSupportedCountry(command: ISupportedRegionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        name: command.name,
        threeLetterName: command.shortName,
        flagUrl: command.flagUrl,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSupportedCountry(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
