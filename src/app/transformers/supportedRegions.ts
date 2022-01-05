import { ISupportedCountryInfo, ISupportedCityInfo } from '../contract/supportedRegions'
import SupportedCity from '../models/SupportedCountryModel'

export const prepareSupportedCountryInfo = (supportedCountry: SupportedCity): ISupportedCountryInfo => {
  return {
    id: supportedCountry.id,
    name: supportedCountry.name,
    shortName: supportedCountry.threeLetterName,
    flagUrl: supportedCountry.flagUrl,
  }
}

export const prepareSupportedCityInfo = (supportedCity: SupportedCity): ISupportedCityInfo => {
  return {
    id: supportedCity.id,
    name: supportedCity.name,
    shortName: supportedCity.threeLetterName,
    flagUrl: supportedCity.flagUrl,
  }
}
