import { EntityRepository, Repository } from 'typeorm'
import SupportedCity from '../models/SupportedCityModel'
import { ISupportedRegionInfoUpdateCommand } from './commands/supportedRegions'

@EntityRepository(SupportedCity)
export default class SupportedCityRepository extends Repository<SupportedCity> {
  public async getBulk(ids: number[]): Promise<Record<number, SupportedCity>> {
    const result: Record<number, SupportedCity> = {}
    const supportedCities = await (ids.length === 0 ? this.find() : this.findByIds(ids))

    supportedCities.forEach(supportedCountry => {
      result[supportedCountry.id] = supportedCountry
    })
    return result
  }

  public async addSupportedCity(command: ISupportedRegionInfoUpdateCommand): Promise<SupportedCity> {
    const newSupportedCity = await this.save({
      name: command.name,
      threeLetterName: command.shortName,
      flagUrl: command.flagUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newSupportedCity
  }

  public async updateSupportedCity(command: ISupportedRegionInfoUpdateCommand): Promise<void> {
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

  public async deleteSupportedCity(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
