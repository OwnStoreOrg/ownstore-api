import { injectable, inject } from 'inversify'
import BaseService from './BaseService'
import { ICatalogueService, IImageService, IProductService } from './interface'
import {
  ICatalogueInfo,
  ICatalogueInfoDelete,
  ICatalogueInfoUpdate,
  ICatalogueInfoUpdateParams,
} from '../contract/catalogue'
import { EntityNotFoundError } from '../errors/EntityError'
import { prepareCatalogueInfo } from '../transformers/catalogue'
import { IFindParams } from '../contract/common'
import { CacheBuild, CacheBulkBuild } from '../decorators/cache'
import { CACHE_MULTIPLIER, SERVICE_CACHE_TTL } from '../constants'
import { lazyInject } from '../container'
import AppTypes from '../AppTypes'
import { flattenList, uniqueList } from '../utils/common'

// These APIs are used at build time. Are also re-validated after few seconds. Hence, keeping cache time very low at API level.
@injectable()
export default class CatalogueService extends BaseService implements ICatalogueService {
  @CacheBulkBuild('CL', [[0]], SERVICE_CACHE_TTL.DEFAULT, 'CTIS')
  private async _prepareCatalogueInfoState(catalogueIds: number[]): Promise<Record<number, ICatalogueInfo>> {
    const catalogues = await this.getCatalogueRepository().getBulk(catalogueIds, {})

    const result: Record<number, ICatalogueInfo> = {}

    for (const [catalogueId, catalogue] of Object.entries(catalogues)) {
      result[catalogueId] = prepareCatalogueInfo(catalogue)
    }

    return result
  }

  public async getCatalogueInfo(id: number): Promise<ICatalogueInfo> {
    const catalogues = await this._prepareCatalogueInfoState([id])
    const catalogueInfo = catalogues[id]

    if (!catalogueInfo) {
      throw new EntityNotFoundError('Catalogue', id)
    }

    return catalogueInfo
  }

  @CacheBuild(
    'CS',
    [
      [0, 'limit'],
      [0, 'offset'],
    ],
    SERVICE_CACHE_TTL.DEFAULT,
    'CTIL'
  )
  public async getAllCatalogueInfos(findParams: IFindParams): Promise<ICatalogueInfo[]> {
    const catalogueIds = await this.getCatalogueRepository().getBulkIds(findParams)

    if (!catalogueIds.length) {
      return []
    }

    const catalogues = await this._prepareCatalogueInfoState(catalogueIds)
    return Object.values(catalogues).sort((a, b) => a.position - b.position)
  }

  public async getCatalogueInfoByIds(ids: number[]): Promise<Record<number, ICatalogueInfo>> {
    const catalogues = await this._prepareCatalogueInfoState(ids)
    return catalogues
  }

  public async updateCatalogueInfo(
    id: number | null,
    params: ICatalogueInfoUpdateParams
  ): Promise<ICatalogueInfoUpdate> {
    const result: ICatalogueInfoUpdate = {
      success: false,
    }

    if (id) {
      await this.getCatalogueRepository().updateCatalogue({
        id: id,
        ...params,
      })
      result.success = true
    } else {
      await this.getCatalogueRepository().addCatalogue({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteCatalogueInfo(id: number): Promise<ICatalogueInfoDelete> {
    const result: ICatalogueInfoDelete = {
      success: false,
    }

    await this.getCatalogueRepository().deleteCatalogue(id)
    result.success = true

    return result
  }

  @CacheBuild('CS', [[0], [1, 'limit'], [1, 'offset']], SERVICE_CACHE_TTL.LONG, 'CIQS')
  public async getAllCatalogueInfosByQuery(query: string, findParams: IFindParams): Promise<ICatalogueInfo[]> {
    const catalogueIds = await this.getCatalogueRepository().getBulkIdsByName(query, findParams)

    if (!catalogueIds.length) {
      return []
    }

    const catalogues = await this._prepareCatalogueInfoState(catalogueIds)
    return Object.values(catalogues).sort((a, b) => a.position - b.position)
  }
}
