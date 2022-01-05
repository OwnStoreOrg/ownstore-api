import { injectable } from 'inversify'
import BaseService from './BaseService'
import { IFAQService } from './interface'
import {
  IFAQInfo,
  IFAQInfoUpdate,
  IFAQInfoUpdateParams,
  IFAQTopicInfo,
  IFAQTopicInfoDelete,
  IFAQTopicInfoUpdate,
  IFAQTopicInfoUpdateParams,
} from '../contract/faq'
import { prepareFAQTopicInfo, prepareFAQInfo } from '../transformers/faq'
import { IFindParams } from '../contract/common'
import { isEmptyObject } from '../utils/common'
import { EntityNotFoundError } from '../errors/EntityError'
import { CacheBuild, CacheBulkBuild, CacheBulkPurge, CachePurge } from '../decorators/cache'
import { CACHE_MULTIPLIER, SERVICE_CACHE_TTL } from '../constants'

// These APIs are used at build time. Are also re-validated after few seconds. Hence, keeping cache time very low at API level.
@injectable()
export default class FAQService extends BaseService implements IFAQService {
  @CacheBulkBuild('FQ', [[0, 'offset'], [0, 'limit'], [1]], SERVICE_CACHE_TTL.LONG, 'FQTS')
  private async _prepareTopicInfoState(
    findParams: IFindParams,
    faqTopicIds: number[]
  ): Promise<Record<number, IFAQTopicInfo>> {
    const faqTopics = await this.getFAQTopicRepository().getBulk(faqTopicIds, findParams)

    const result: Record<number, IFAQTopicInfo> = {}

    Object.entries(faqTopics).forEach(([faqTopicId, faqTopic]) => {
      result[faqTopicId] = prepareFAQTopicInfo(faqTopic)
    })

    return result
  }

  @CacheBuild('FQ', [[0, 'offset'], [0, 'limit'], [1]], SERVICE_CACHE_TTL.LONG, 'FQTL')
  public async getAllFAQTopicInfos(findParams: IFindParams): Promise<IFAQTopicInfo[]> {
    const faqTopicIds = await this.getFAQTopicRepository().getBulkIds(findParams)
    const faqTopics = await this._prepareTopicInfoState(findParams, faqTopicIds)
    return Object.values(faqTopics).sort((a, b) => a.position - b.position)
  }

  public async getFAQTopicInfo(faqTopicId: number): Promise<IFAQTopicInfo> {
    const topicInfos = await this._prepareTopicInfoState({}, [faqTopicId])
    const topicInfo = topicInfos[faqTopicId]

    if (!topicInfo) {
      throw new EntityNotFoundError('FAQ Topic', faqTopicId)
    }

    return topicInfo
  }

  public async updateFAQTopicInfo(
    faqTopicId: number | null,
    params: IFAQTopicInfoUpdateParams
  ): Promise<IFAQTopicInfoUpdate> {
    const result: IFAQTopicInfoUpdate = {
      success: false,
    }

    if (faqTopicId) {
      await this.getFAQTopicRepository().updateFAQTopic({
        id: faqTopicId,
        ...params,
      })
      result.success = true
    } else {
      await this.getFAQTopicRepository().addFAQTopic({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteFAQTopicInfo(faqTopicId: number): Promise<IFAQTopicInfoDelete> {
    const result: IFAQTopicInfoDelete = {
      success: false,
    }

    await this.getFAQTopicRepository().deleteFAQTopic(faqTopicId)
    result.success = true

    return result
  }

  @CacheBulkBuild('FQ', [[0, 'limit'], [0, 'offset'], [1]], SERVICE_CACHE_TTL.LONG, 'FQIS')
  private async _prepareFAQInfoState(
    findParams: IFindParams,
    faqTopicIds: number[]
  ): Promise<Record<number, IFAQInfo[]>> {
    const faqs = await this.getFAQRepository().getBulkByTopicId(faqTopicIds, findParams)

    const result: Record<number, IFAQInfo[]> = {}

    Object.entries(faqs).forEach(([topicId, faqs]) => {
      result[topicId] = faqs.map(prepareFAQInfo).sort((a, b) => a.position - b.position)
    })

    return result
  }

  public async getFAQInfosByTopicId(faqTopicId: number, findParams: IFindParams): Promise<IFAQInfo[]> {
    const faqInfosMap = await this._prepareFAQInfoState(findParams, [faqTopicId])
    const faqInfos = faqInfosMap[faqTopicId]

    if (!faqInfos) {
      return []
    }

    return faqInfos
  }

  @CacheBuild('FQ', [[0]], SERVICE_CACHE_TTL.LONG, 'FQID')
  public async getFAQInfoById(faqId: number): Promise<IFAQInfo> {
    const faqs = await this.getFAQRepository().getBulk([faqId])
    const faq = faqs[faqId]

    if (!faq) {
      throw new EntityNotFoundError('FAQ', faqId)
    }

    return prepareFAQInfo(faq)
  }

  public async updateFAQInfo(faqId: number | null, params: IFAQInfoUpdateParams): Promise<IFAQInfoUpdate> {
    const result: IFAQInfoUpdate = {
      success: false,
    }

    if (faqId) {
      await this.getFAQRepository().updateFAQ({
        id: faqId,
        ...params,
      })
      result.success = true
    } else {
      await this.getFAQRepository().addFAQ({
        id: null,
        ...params,
      })
      result.success = true
    }

    return result
  }

  public async deleteFAQInfo(faqId: number): Promise<IFAQInfoUpdate> {
    const result: IFAQInfoUpdate = {
      success: false,
    }

    await this.getFAQRepository().deleteFAQ(faqId)
    result.success = true

    return result
  }
}
