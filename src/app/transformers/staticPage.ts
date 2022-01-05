import { IStaticPageDetail } from '../contract/staticPage'
import PagePrivacyPolicy from '../models/PagePrivacyPolicyModel'
import PageRefundPolicy from '../models/PageRefundPolicyModel'
import PageShippingPolicy from '../models/PageShippingPolicyModel'
import PageTnC from '../models/PageTnCModel'

export const prepareStaticPageDetail = (
  page: PageTnC | PagePrivacyPolicy | PageRefundPolicy | PageShippingPolicy
): IStaticPageDetail => {
  return {
    title: page?.title || '',
    body: page?.body || '',
    updatedDateTime: page?.updatedAt ? new Date(page.updatedAt) : null,
  }
}
