import { getCustomRepository } from 'typeorm'
import { injectable } from 'inversify'
import SectionSlideRepository from '../repositories/SectionSlideRepository'
import BlogRepository from '../repositories/BlogRepository'
import UserCartItemRepository from '../repositories/UserCartItemRepository'
import CatalogueRepository from '../repositories/CatalogueRepository'
import ComboProductItemRepository from '../repositories/ComboProductItemRepository'
import IndividualProductRepository from '../repositories/IndividualProductRepository'
import ComboProductRepository from '../repositories/ComboProductRepository'
import SectionRepository from '../repositories/SectionRepository'
import SectionProductRepository from '../repositories/SectionProductRepository'
import SectionCatalogueRepository from '../repositories/SectionCatalogueRepository'
import SectionBlogRepository from '../repositories/SectionBlogRepository'
import SectionCustomerFeedbackRepository from '../repositories/SectionCustomerFeedbackRepository'
import SectionUSPRepository from '../repositories/SectionUSPRepository'
import SectionProcedureRepository from '../repositories/SectionProcedureRepository'
import SectionPageHomeRepository from '../repositories/SectionPageHomeRepository'
import SectionPageExploreRepository from '../repositories/SectionPageExploreRepository'
import SectionPageErrorRepository from '../repositories/SectionPageErrorRepository'
import SectionPageIndividualProductRepository from '../repositories/SectionPageIndividualProductRepository'
import SectionPageComboProductRepository from '../repositories/SectionPageComboProductRepository'
import SectionPageSearchRepository from '../repositories/SectionPageSearchRepository'
import SectionCustomRepository from '../repositories/SectionCustomRepository'
import OrderRepository from '../repositories/OrderRepository'
import OrderStatusTypeRepository from '../repositories/OrderStatusTypeRepository'
import OrderStatusHistoryRepository from '../repositories/OrderStatusHistoryRepository'
import OrderCancellationRepository from '../repositories/OrderCancellationRepository'
import ProductSKURepository from '../repositories/ProductSKURepository'
import ProductTagRepository from '../repositories/ProductTagRepository'
import ProductAttributeRepository from '../repositories/ProductAttributeRepository'
import ProductAttributeKeyRepository from '../repositories/ProductAttributeKeyRepository'
import ProductFeatureSectionRepository from '../repositories/ProductFeatureSectionRepository'
import ProductBrandRepository from '../repositories/ProductBrandRepository'
import ProductsRelationRepository from '../repositories/ProductsRelationRepository'
import UserAddressRepository from '../repositories/UserAddressRepository'
import userLoginHistoryRepository from '../repositories/userLoginHistoryRepository'
import UserRepository from '../repositories/UserRepository'
import SupportedCountryRepository from '../repositories/SupportedCountryRepository'
import CurrencyRepository from '../repositories/CurrencyRepository'
import SupportedCityRepository from '../repositories/SupportedCityRepository'
import FAQTopicRepository from '../repositories/FAQTopicRepository'
import FAQRepository from '../repositories/FAQRepository'
import PageTnCRepository from '../repositories/PageTnCRepository'
import PagePrivacyPolicyRepository from '../repositories/PagePrivacyPolicyRepository'
import PageRefundPolicyRepository from '../repositories/PageRefundPolicyRepository'
import PageShippingPolicyRepository from '../repositories/PageShippingPolicyRepository'
import UserWishRepository from '../repositories/UserWishRepository'
import UserPasswordHintRepository from '../repositories/UserPasswordHintRepository'
import SecurityQuestionRepository from '../repositories/SecurityQuestionRepository'
import UserSecurityQuestionAnswerRepository from '../repositories/UserSecurityQuestionAnswerRepository'
import ImageRepository from '../repositories/ImageRepository'

@injectable()
export default class BaseService {
  public getSectionSlideRepository(): SectionSlideRepository {
    return getCustomRepository(SectionSlideRepository)
  }

  public getBlogRepository(): BlogRepository {
    return getCustomRepository(BlogRepository)
  }

  public getUserCartItemRepository(): UserCartItemRepository {
    return getCustomRepository(UserCartItemRepository)
  }

  public getCatalogueRepository(): CatalogueRepository {
    return getCustomRepository(CatalogueRepository)
  }

  public getIndividualProductRepository(): IndividualProductRepository {
    return getCustomRepository(IndividualProductRepository)
  }

  public getComboProductItemRepository(): ComboProductItemRepository {
    return getCustomRepository(ComboProductItemRepository)
  }

  public getComboProductRepository(): ComboProductRepository {
    return getCustomRepository(ComboProductRepository)
  }

  public getSectionProductRepository(): SectionProductRepository {
    return getCustomRepository(SectionProductRepository)
  }

  public getSectionCatalogueRepository(): SectionCatalogueRepository {
    return getCustomRepository(SectionCatalogueRepository)
  }

  public getSectionBlogRepository(): SectionBlogRepository {
    return getCustomRepository(SectionBlogRepository)
  }

  public getSectionCustomerFeedbackRepository(): SectionCustomerFeedbackRepository {
    return getCustomRepository(SectionCustomerFeedbackRepository)
  }

  public getSectionProcedureRepository(): SectionProcedureRepository {
    return getCustomRepository(SectionProcedureRepository)
  }

  public getSectionUSPRepository(): SectionUSPRepository {
    return getCustomRepository(SectionUSPRepository)
  }

  public getSectionPageHomeRepository(): SectionPageHomeRepository {
    return getCustomRepository(SectionPageHomeRepository)
  }

  public getSectionPageExploreRepository(): SectionPageExploreRepository {
    return getCustomRepository(SectionPageExploreRepository)
  }

  public getSectionPageErrorRepository(): SectionPageErrorRepository {
    return getCustomRepository(SectionPageErrorRepository)
  }

  public getSectionPageIndividualProductRepository(): SectionPageIndividualProductRepository {
    return getCustomRepository(SectionPageIndividualProductRepository)
  }

  public getSectionPageComboProductRepository(): SectionPageComboProductRepository {
    return getCustomRepository(SectionPageComboProductRepository)
  }

  public getSectionPageSearchRepository(): SectionPageSearchRepository {
    return getCustomRepository(SectionPageSearchRepository)
  }

  public getSectionCustomRepository(): SectionCustomRepository {
    return getCustomRepository(SectionCustomRepository)
  }

  public getOrderRepository(): OrderRepository {
    return getCustomRepository(OrderRepository)
  }

  public getOrderStatusTypeRepository(): OrderStatusTypeRepository {
    return getCustomRepository(OrderStatusTypeRepository)
  }

  public getOrderStatusHistoryRepository(): OrderStatusHistoryRepository {
    return getCustomRepository(OrderStatusHistoryRepository)
  }

  public getOrderCancellationRepository(): OrderCancellationRepository {
    return getCustomRepository(OrderCancellationRepository)
  }

  public getProductSKURepository(): ProductSKURepository {
    return getCustomRepository(ProductSKURepository)
  }

  public getProductTagRepository(): ProductTagRepository {
    return getCustomRepository(ProductTagRepository)
  }

  public getProductAttributeRepository(): ProductAttributeRepository {
    return getCustomRepository(ProductAttributeRepository)
  }

  public getProductAttributeKeyRepository(): ProductAttributeKeyRepository {
    return getCustomRepository(ProductAttributeKeyRepository)
  }

  public getProductFeatureSectionRepository(): ProductFeatureSectionRepository {
    return getCustomRepository(ProductFeatureSectionRepository)
  }

  public getProductBrandRepository(): ProductBrandRepository {
    return getCustomRepository(ProductBrandRepository)
  }

  public getProductsRelationRepository(): ProductsRelationRepository {
    return getCustomRepository(ProductsRelationRepository)
  }

  public getSectionRepository(): SectionRepository {
    return getCustomRepository(SectionRepository)
  }

  public getUserAddressRepository(): UserAddressRepository {
    return getCustomRepository(UserAddressRepository)
  }

  public getuserLoginHistoryRepository(): userLoginHistoryRepository {
    return getCustomRepository(userLoginHistoryRepository)
  }

  public getUserRepository(): UserRepository {
    return getCustomRepository(UserRepository)
  }

  public getSupportedCountryRepository(): SupportedCountryRepository {
    return getCustomRepository(SupportedCountryRepository)
  }

  public getCurrencyRepository(): CurrencyRepository {
    return getCustomRepository(CurrencyRepository)
  }

  public getSupportedCityRepository(): SupportedCityRepository {
    return getCustomRepository(SupportedCityRepository)
  }

  public getFAQTopicRepository(): FAQTopicRepository {
    return getCustomRepository(FAQTopicRepository)
  }

  public getFAQRepository(): FAQRepository {
    return getCustomRepository(FAQRepository)
  }

  public getPageTnCRepository(): PageTnCRepository {
    return getCustomRepository(PageTnCRepository)
  }

  public getPagePrivacyPolicyRepository(): PagePrivacyPolicyRepository {
    return getCustomRepository(PagePrivacyPolicyRepository)
  }

  public getPageRefundPolicyRepository(): PageRefundPolicyRepository {
    return getCustomRepository(PageRefundPolicyRepository)
  }

  public getPageShippingPolicyRepository(): PageShippingPolicyRepository {
    return getCustomRepository(PageShippingPolicyRepository)
  }

  public getUserWishRepository(): UserWishRepository {
    return getCustomRepository(UserWishRepository)
  }

  public getUserPasswordHintRepository(): UserPasswordHintRepository {
    return getCustomRepository(UserPasswordHintRepository)
  }

  public getSecurityQuestionRepository(): SecurityQuestionRepository {
    return getCustomRepository(SecurityQuestionRepository)
  }

  public getUserSecurityQuestionAnswerRepository(): UserSecurityQuestionAnswerRepository {
    return getCustomRepository(UserSecurityQuestionAnswerRepository)
  }

  public getImageRepository(): ImageRepository {
    return getCustomRepository(ImageRepository)
  }
}
