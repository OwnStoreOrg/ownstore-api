import { injectable, inject } from 'inversify'
import BaseService from './BaseService'
import { ISearchService, IProductService, ICatalogueService } from './interface'
import { ISearchInfo } from '../contract/search'
import AppTypes from '../AppTypes'
import { IFindParams } from '../contract/common'
import { lazyInject } from '../container'

@injectable()
export default class SearchService extends BaseService implements ISearchService {
  @lazyInject(AppTypes.CatalogueService)
  private catalogueService!: ICatalogueService

  @lazyInject(AppTypes.ProductService)
  private productService!: IProductService

  public async getSearchInfoByQuery(query: string, findParams: IFindParams): Promise<ISearchInfo> {
    let searchInfo: ISearchInfo = {
      catalogues: null,
      individualProducts: null,
      comboProducts: null,
    }

    const [catalogues, individualProducts, individualCombos] = await Promise.all([
      this.catalogueService.getAllCatalogueInfosByQuery(query, findParams),
      this.productService.getAllIndividualProductInfosByQuery(query, findParams),
      this.productService.getAllComboProductInfosByQuery(query, findParams),
    ])

    searchInfo = {
      catalogues: catalogues,
      individualProducts: individualProducts,
      comboProducts: individualCombos,
    }

    return searchInfo
  }
}
