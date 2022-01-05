import { injectable } from 'inversify'
import { CACHE_MULTIPLIER, SERVICE_CACHE_TTL } from '../constants'
import { IStaticPageDetail, IStaticPageUpdate, IStaticPageUpdateParams } from '../contract/staticPage'
import { CacheBuild, CachePurge } from '../decorators/cache'
import { prepareStaticPageDetail } from '../transformers/staticPage'
import BaseService from './BaseService'
import { IStaticPageService } from './interface'

@injectable()
export default class StaticService extends BaseService implements IStaticPageService {
  @CacheBuild('TC', [], SERVICE_CACHE_TTL.LONG, 'TNCD')
  public async getTnCDetail(): Promise<IStaticPageDetail> {
    const tnc = await this.getPageTnCRepository().getTnC()
    return prepareStaticPageDetail(tnc)
  }

  public async updateTnCDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate> {
    const result: IStaticPageUpdate = {
      success: false,
    }

    await this.getPageTnCRepository().updateTnC({
      ...params,
    })
    result.success = true

    return result
  }

  @CacheBuild('PP', [], SERVICE_CACHE_TTL.LONG, 'PRPD')
  public async getPrivacyPolicyDetail(): Promise<IStaticPageDetail> {
    const privacyPolicy = await this.getPagePrivacyPolicyRepository().getPrivacyPolicy()
    return prepareStaticPageDetail(privacyPolicy)
  }

  public async updatePrivacyPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate> {
    const result: IStaticPageUpdate = {
      success: false,
    }

    await this.getPagePrivacyPolicyRepository().updatePrivacyPolicy({
      ...params,
    })
    result.success = true

    return result
  }

  @CacheBuild('RP', [], SERVICE_CACHE_TTL.LONG, 'RFPD')
  public async getRefundPolicyDetail(): Promise<IStaticPageDetail> {
    const privacyPolicy = await this.getPageRefundPolicyRepository().getRefundPolicy()
    return prepareStaticPageDetail(privacyPolicy)
  }

  public async updateRefundPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate> {
    const result: IStaticPageUpdate = {
      success: false,
    }

    await this.getPageRefundPolicyRepository().updateRefundPolicy({
      ...params,
    })
    result.success = true

    return result
  }

  @CacheBuild('RP', [], SERVICE_CACHE_TTL.LONG, 'RFPD')
  public async getShippingPolicyDetail(): Promise<IStaticPageDetail> {
    const privacyPolicy = await this.getPageShippingPolicyRepository().getShippingPolicy()
    return prepareStaticPageDetail(privacyPolicy)
  }

  public async updateShippingPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate> {
    const result: IStaticPageUpdate = {
      success: false,
    }

    await this.getPageShippingPolicyRepository().updateShippingPolicy({
      ...params,
    })
    result.success = true

    return result
  }
}
