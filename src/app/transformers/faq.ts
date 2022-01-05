import FAQTopic from '../models/FAQTopicModel'
import { IFAQTopicInfo, IFAQInfo } from '../contract/faq'
import FAQ from '../models/FAQModel'
import { generateSlug } from '../utils/common'

export const prepareFAQTopicInfo = (faqTopic: FAQTopic): IFAQTopicInfo => {
  return {
    id: faqTopic.id,
    name: faqTopic.name,
    slug: generateSlug(faqTopic.name),
    position: faqTopic.position,
    isActive: faqTopic.isActive,
  }
}

export const prepareFAQInfo = (faq: FAQ): IFAQInfo => {
  return {
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    position: faq.position,
    isActive: faq.isActive,
  }
}
