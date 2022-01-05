import BaseService from './BaseService'
import { ISupportedRegionService } from './interface'
import {
  ISupportedRegionInfo,
  ISupportedRegionInfoDelete,
  ISupportedRegionInfoUpdate,
  ISupportedRegionInfoUpdateParams,
  ISupportedRegionsInfo,
} from '../contract/supportedRegions'
import { prepareSupportedCountryInfo, prepareSupportedCityInfo } from '../transformers/supportedRegions'
import { CacheBuild, CachePurge } from '../decorators/cache'
import { CACHE_MULTIPLIER, SERVICE_CACHE_TTL } from '../constants'
import { SupportedRegionType } from '../contract/constants'
import { EntityNotFoundError } from '../errors/EntityError'

export default class SupportedRegionsService extends BaseService implements ISupportedRegionService {
  @CacheBuild('SR', [], SERVICE_CACHE_TTL.LONG, 'SPRI')
  public async getSupportedRegionsInfo(): Promise<ISupportedRegionsInfo> {
    const supportedCountries = await this.getSupportedCountryRepository().getBulk([])
    const supportedCountriesInfo = Object.values(supportedCountries).map(prepareSupportedCountryInfo)

    const supportedCities = await this.getSupportedCityRepository().getBulk([])
    const supportedCitiesInfo = Object.values(supportedCities).map(prepareSupportedCityInfo)

    return {
      countries: supportedCountriesInfo,
      cities: supportedCitiesInfo,
    }
  }

  public async getSupportedRegionById(id: number, type: SupportedRegionType): Promise<ISupportedRegionInfo> {
    const detail = await this.getSupportedRegionsInfo()
    const supportedRegions = type === SupportedRegionType.COUNTRY ? detail.countries : detail.cities

    const matchingSupporteRegion = supportedRegions.find(supportedRegion => supportedRegion.id === id)

    if (!matchingSupporteRegion) {
      throw new EntityNotFoundError(`Supported Region - ${type}`, id)
    }

    return matchingSupporteRegion
  }

  public async updateSupportedRegion(
    id: number | null,
    type: SupportedRegionType,
    params: ISupportedRegionInfoUpdateParams
  ): Promise<ISupportedRegionInfoUpdate> {
    const result: ISupportedRegionInfoUpdate = {
      success: false,
    }

    if (id) {
      if (type === SupportedRegionType.COUNTRY) {
        await this.getSupportedCountryRepository().updateSupportedCountry({
          id: id,
          ...params,
        })
      } else {
        await this.getSupportedCityRepository().updateSupportedCity({
          id: id,
          ...params,
        })
      }
      result.success = true
    } else {
      if (type === SupportedRegionType.COUNTRY) {
        await this.getSupportedCountryRepository().addSupportedCountry({
          id: null,
          ...params,
        })
      } else {
        await this.getSupportedCityRepository().addSupportedCity({
          id: null,
          ...params,
        })
      }
      result.success = true
    }

    return result
  }

  public async deleteSupportedRegion(id: number, type: SupportedRegionType): Promise<ISupportedRegionInfoDelete> {
    const result: ISupportedRegionInfoDelete = {
      success: false,
    }

    if (type === SupportedRegionType.COUNTRY) {
      await this.getSupportedCountryRepository().deleteSupportedCountry(id)
    } else {
      await this.getSupportedCityRepository().deleteSupportedCity(id)
    }

    result.success = true

    return result
  }
}
