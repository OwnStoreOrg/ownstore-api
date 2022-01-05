import { IHealthStatus } from '../contract/health'
import {
  ICatalogueInfo,
  ICatalogueInfoDelete,
  ICatalogueInfoUpdate,
  ICatalogueInfoUpdateParams,
} from '../contract/catalogue'
import {
  IIndividualProductInfo,
  IIndividualProductDetail,
  IComboProductInfo,
  IComboProductDetail,
  IIndividualProductDetailUpdateParams,
  IIndividualProductDetailUpdate,
  IProductBrandInfo,
  IProductBrandInfoUpdateParams,
  IProductBrandInfoUpdate,
  IProductBrandInfoDelete,
  IProductAttributeKeyInfo,
  IProductAttributeKeyInfoUpdateParams,
  IProductAttributeKeyInfoUpdate,
  IProductAttributeKeyInfoDelete,
  IProductsRelationInfo,
  IProductsRelationInfoUpdateParams,
  IProductsRelationInfoUpdate,
  IProductsRelationInfoDelete,
  IComboProductDetailUpdateParams,
  IComboProductDetailUpdate,
  IIndividualProductDetailDeleteParams,
  IIndividualProductDetailDelete,
  IComboProductDetailDeleteParams,
  IComboProductDetailDelete,
} from '../contract/product'
import { IBlogInfo, IBlogInfoDelete, IBlogInfoUpdate, IBlogInfoUpdateParams } from '../contract/blog'
import {
  ISectionInfo,
  ISlideInfo,
  ICustomerFeedbackInfo,
  IProcedureInfo,
  IUSPInfo,
  ICustomSectionBody,
  ISectionInfoUpdateParams,
  ISectionInfoUpdate,
  ISectionInfoDelete,
  ICatalogueSectionInfo,
  IBlogSectionInfo,
  ICatalogueSectionInfoUpdateParams,
  ICatalogueSectionInfoUpdate,
  ICatalogueSectionInfoDelete,
  IBlogSectionInfoUpdateParams,
  IBlogSectionInfoUpdate,
  IBlogSectionInfoDelete,
  ISlideInfoUpdateParams,
  ISlideInfoUpdate,
  ISlideInfoDelete,
  IUSPInfoUpdateParams,
  IUSPInfoUpdate,
  IUSPInfoDelete,
  IProcedureInfoUpdateParams,
  IProcedureInfoUpdate,
  IProcedureInfoDelete,
  ICustomerFeedbackInfoUpdateParams,
  ICustomerFeedbackInfoUpdate,
  ICustomerFeedbackInfoDelete,
  ICustomSectionBodyUpdateParams,
  ICustomSectionBodyUpdate,
  ICustomSectionBodyDelete,
  IPageSectionInfoUpdateParams,
  IPageSectionInfoUpdate,
  IPageSectionInfoDelete,
  IProductSectionInfo,
  IProductSectionInfoUpdate,
  IProductSectionInfoUpdateParams,
  IProductSectionInfoDelete,
} from '../contract/section'
import {
  IUserRegisterationInfo,
  IUserDetail,
  IUserInfo,
  IUserEmailLoginInfo,
  IUserInfoUpdate,
  IUserRegisterationParams,
  IUserEmailLoginParams,
  IUserInfoUpdateParams,
  IUserChangePasswordParams,
  IUserChangePasswordInfo,
  IUserGlobalDetail,
  IUserGlobalDetailParams,
  IUserLoginAttributesInfo,
  IUserResetPasswordInfo,
  IUserResetPasswordParams,
} from '../contract/user'
import {
  IUserSecurityPasswordHintInfo,
  IUserUpdateSecurityPasswordHintInfoParams,
  IUserUpdateSecurityPasswordHintInfo,
  IUserSecurityQuestionsDetail,
  IUserSecurityQuestionAnswer,
  IUserUpdateSecurityQuestionAnswerParams,
  IUserUpdateSecurityQuestionAnswer,
  IUserVerifySecurityQuestionAnswerParams,
  IUserVerifySecurityQuestionAnswer,
} from '../contract/security'
import {
  ISupportedRegionInfo,
  ISupportedRegionInfoDelete,
  ISupportedRegionInfoUpdate,
  ISupportedRegionInfoUpdateParams,
  ISupportedRegionsInfo,
} from '../contract/supportedRegions'
import {
  IFAQTopicInfo,
  IFAQInfo,
  IFAQTopicInfoUpdateParams,
  IFAQTopicInfoUpdate,
  IFAQTopicInfoDelete,
  IFAQInfoUpdate,
  IFAQInfoUpdateParams,
} from '../contract/faq'
import { ISearchInfo } from '../contract/search'
import { IUserWishInfo, IUserWishInfoAdd, IUserWishInfoAddParams, IUserWishInfoDelete } from '../contract/userWish'
import { ICartDetail, IUserCartItemAdd, IUserCartItemAddParams, IUserCartItemDelete } from '../contract/cart'
import {
  IISecurityQuestionInfoDelete,
  IISecurityQuestionInfoUpdate,
  IISecurityQuestionInfoUpdateParams,
  ISecurityAnswerInfo,
  ISecurityQuestionInfo,
} from '../contract/security'
import { IInitiatePayment, ISuccessfulPayment, ISuccessfulPaymentParams } from '../contract/payment'
import {
  IRefundOrderDetail,
  IOrderAddParams,
  IOrderDetail,
  IOrderInfo,
  IRefundOrderDetailParams,
  IOrderStatusInfo,
  IOrderStatusInfoUpdateParams,
  IOrderStatusInfoUpdate,
  IOrderStatusInfoDelete,
  IUpdateOrderInfo,
  IUpdateOrderInfoParams,
} from '../contract/order'
import { IUserAddressInfo, IUserAddressInfoUpdateParams, IUserAddressInfoUpdate } from '../contract/address'
import { IAdminVerify, IAdminVerifyParams } from '../contract/admin'
import {
  ICurrencyInfo,
  ICurrencyInfoDelete,
  ICurrencyInfoUpdate,
  ICurrencyInfoUpdateParams,
} from '../contract/currency'
import { IFindParams } from '../contract/common'
import { PageSectionType, ProductType, SupportedRegionType } from '../contract/constants'
import { IImageInfo, IImageInfoUpdate, IImageInfoUpdateParams } from '../contract/image'
import { IStaticPageDetail, IStaticPageUpdate, IStaticPageUpdateParams } from '../contract/staticPage'
import { ISettingInfo } from '../contract/setting'

export interface IHealthService {
  getHealthStatus(): Promise<IHealthStatus>
}

export interface ICatalogueService {
  getAllCatalogueInfos(findParams: IFindParams): Promise<ICatalogueInfo[]>
  getCatalogueInfo(id: number): Promise<ICatalogueInfo>
  getCatalogueInfoByIds(ids: number[]): Promise<Record<number, ICatalogueInfo>>
  updateCatalogueInfo(id: number | null, params: ICatalogueInfoUpdateParams): Promise<ICatalogueInfoUpdate>
  deleteCatalogueInfo(id: number): Promise<ICatalogueInfoDelete>
  getAllCatalogueInfosByQuery(query: string, findParams: IFindParams): Promise<ICatalogueInfo[]>
}

export interface IProductService {
  getAllIndividualProductInfos(findParams: IFindParams): Promise<IIndividualProductInfo[]>
  getIndividualProductInfo(id: number): Promise<IIndividualProductInfo>
  getIndividualProductInfoByIds(ids: number[]): Promise<Record<number, IIndividualProductInfo>>
  getIndividualProductDetail(id: number): Promise<IIndividualProductDetail>
  updateIndividualProductDetail(
    id: number | null,
    params: IIndividualProductDetailUpdateParams
  ): Promise<IIndividualProductDetailUpdate>
  deleteIndividualProductDetail(
    productId: number,
    params: IIndividualProductDetailDeleteParams
  ): Promise<IIndividualProductDetailDelete>
  getAllIndividualProductInfosByQuery(query: string, findParams: IFindParams): Promise<IIndividualProductInfo[]>
  getIndividualProductInfosByCatalogueId(
    catalogueId: number,
    findParams: IFindParams
  ): Promise<IIndividualProductInfo[]>

  getAllComboProductInfos(findParams: IFindParams): Promise<IComboProductInfo[]>
  getComboProductInfo(id: number): Promise<IComboProductInfo>
  getComboProductInfoByIds(ids: number[]): Promise<Record<number, IComboProductInfo>>
  getComboProductDetail(id: number): Promise<IComboProductDetail>
  updateComboProductDetail(
    id: number | null,
    params: IComboProductDetailUpdateParams
  ): Promise<IComboProductDetailUpdate>
  deleteComboProductDetail(
    productId: number,
    params: IComboProductDetailDeleteParams
  ): Promise<IComboProductDetailDelete>
  getAllComboProductInfosByQuery(query: string, findParams: IFindParams): Promise<IComboProductInfo[]>
}

export interface IProductElementService {
  getAllProductBrandInfos(findParams: IFindParams): Promise<IProductBrandInfo[]>
  getProductBrandInfo(id: number): Promise<IProductBrandInfo>
  updateProductBrandInfo(id: number | null, params: IProductBrandInfoUpdateParams): Promise<IProductBrandInfoUpdate>
  deleteProductBrandInfo(id: number): Promise<IProductBrandInfoDelete>

  getAllProductAttributeKeyInfos(findParams: IFindParams): Promise<IProductAttributeKeyInfo[]>
  getProductAttributeKeyInfo(id: number): Promise<IProductAttributeKeyInfo>
  updateProductAttributeKeyInfo(
    id: number | null,
    params: IProductAttributeKeyInfoUpdateParams
  ): Promise<IProductAttributeKeyInfoUpdate>
  deleteProductAttributeKeyInfo(id: number): Promise<IProductAttributeKeyInfoDelete>

  getAllProductsRelationInfos(findParams: IFindParams): Promise<IProductsRelationInfo[]>
  getProductsRelationInfo(id: number): Promise<IProductsRelationInfo>
  getProductsRelationInfoByIds(ids: number[]): Promise<Record<number, IProductsRelationInfo>>
  updateProductsRelationInfo(
    id: number | null,
    params: IProductsRelationInfoUpdateParams
  ): Promise<IProductsRelationInfoUpdate>
  deleteProductsRelationInfo(id: number): Promise<IProductsRelationInfoDelete>
}

export interface IBlogService {
  getAllBlogInfos(findParams: IFindParams): Promise<IBlogInfo[]>
  getBlogInfo(id: number): Promise<IBlogInfo>
  getBlogInfoByIds(ids: number[]): Promise<Record<number, IBlogInfo>>
  updateBlogInfo(id: number | null, params: IBlogInfoUpdateParams): Promise<IBlogInfoUpdate>
  deleteBlogInfo(id: number): Promise<IBlogInfoDelete>
  getAllBlogInfosByQuery(query: string, findParams: IFindParams): Promise<IBlogInfo[]>
}

export interface ISectionItemService {
  getSlideInfosBySectionsIds(findParams: IFindParams, sectionIds: number[]): Promise<Record<number, ISlideInfo[]>>
  updateSlideInfo(
    sectionId: number,
    slideId: number | number,
    params: ISlideInfoUpdateParams
  ): Promise<ISlideInfoUpdate>
  deleteSlideInfo(sectionId: number, slideId: number): Promise<ISlideInfoDelete>

  getUSPInfosBySectionIds(findParams: IFindParams, sectionIds: number[]): Promise<Record<number, IUSPInfo[]>>
  updateUSPInfo(sectionId: number, uspId: number | number, params: IUSPInfoUpdateParams): Promise<IUSPInfoUpdate>
  deleteUSPInfo(sectionId: number, uspId: number): Promise<IUSPInfoDelete>

  getProcedureInfosBySectionsIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IProcedureInfo[]>>
  updateProcedureInfo(
    sectionId: number,
    procedureId: number | number,
    params: IProcedureInfoUpdateParams
  ): Promise<IProcedureInfoUpdate>
  deleteProcedureInfo(sectionId: number, procedureId: number): Promise<IProcedureInfoDelete>

  getCustomerFeedbackInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICustomerFeedbackInfo[]>>
  updateCustomerFeedbackInfo(
    sectionId: number,
    feedbackId: number | number,
    params: ICustomerFeedbackInfoUpdateParams
  ): Promise<ICustomerFeedbackInfoUpdate>
  deleteCustomerFeedbackInfo(sectionId: number, feedbackId: number): Promise<ICustomerFeedbackInfoDelete>

  getCustomBodyInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICustomSectionBody[]>>
  updateCustomSectionBodyInfo(
    sectionId: number,
    customSectionId: number | number,
    params: ICustomSectionBodyUpdateParams
  ): Promise<ICustomSectionBodyUpdate>
  deleteCustomSectionBodyInfo(sectionId: number, customSectionId: number): Promise<ICustomSectionBodyDelete>

  getProductSectionInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IProductSectionInfo[]>>
  updateProductSection(
    sectionId: number,
    dealId: number | number,
    params: IProductSectionInfoUpdateParams
  ): Promise<IProductSectionInfoUpdate>
  deleteProductSection(sectionId: number, dealId: number): Promise<IProductSectionInfoDelete>

  getCatalogueSectionInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, ICatalogueSectionInfo[]>>
  updateCatalogueSectionInfo(
    sectionId: number,
    catalogueSectionId: number | number,
    params: ICatalogueSectionInfoUpdateParams
  ): Promise<ICatalogueSectionInfoUpdate>
  deleteCatalogueSectionInfo(sectionId: number, catalogueSectionId: number): Promise<ICatalogueSectionInfoDelete>

  getSectionBlogInfosBySectionIds(
    findParams: IFindParams,
    sectionIds: number[]
  ): Promise<Record<number, IBlogSectionInfo[]>>
  updateBlogSectionInfo(
    sectionId: number,
    blogSectionId: number | number,
    params: IBlogSectionInfoUpdateParams
  ): Promise<IBlogSectionInfoUpdate>
  deleteBlogSectionInfo(sectionId: number, blogSectionId: number): Promise<IBlogSectionInfoDelete>
}

export interface ISectionService {
  getAllSectionInfos(findParams: IFindParams): Promise<ISectionInfo[]>
  getSectionInfoById(id: number): Promise<ISectionInfo>
  updateSectionInfo(id: number | null, params: ISectionInfoUpdateParams): Promise<ISectionInfoUpdate>
  deleteSectionInfo(id: number): Promise<ISectionInfoDelete>

  getAllPageSections(pageType: PageSectionType): Promise<ISectionInfo[]>
  getPageSectionInfoById(id: number, pageType: PageSectionType): Promise<ISectionInfo>
  updatePageSectionInfo(
    id: number | null,
    pageType: PageSectionType,
    params: IPageSectionInfoUpdateParams
  ): Promise<IPageSectionInfoUpdate>
  deletePageSectionInfo(id: number, pageType: PageSectionType): Promise<IPageSectionInfoDelete>
}

export interface IUserService {
  getAllUserInfos(findParams: IFindParams): Promise<IUserInfo[]>
  getUserInfo(userId: number): Promise<IUserInfo>
  getUserDetail(userId: number): Promise<IUserDetail>
  getUserGlobalDetail(userId: number, params: IUserGlobalDetailParams): Promise<IUserGlobalDetail>
  getAllUserInfosByQuery(query: string, params: IFindParams): Promise<IUserInfo[]>

  updateUserInfo(userId: number, params: IUserInfoUpdateParams): Promise<IUserInfoUpdate>

  registerUser(params: IUserRegisterationParams): Promise<IUserRegisterationInfo>
  emailLoginUser(params: IUserEmailLoginParams): Promise<IUserEmailLoginInfo>
  changePassword(userId: number, params: IUserChangePasswordParams): Promise<IUserChangePasswordInfo>
  resetPassword(params: IUserResetPasswordParams): Promise<IUserResetPasswordInfo>

  getUserLoginAttributesInfo(userId: number, findParams: IFindParams): Promise<IUserLoginAttributesInfo[]>
}

export interface ISettingService {
  getSettingInfo(userId: number): Promise<ISettingInfo>
}

export interface ISecurityService {
  getUserPasswordHintInfo(userId: number): Promise<IUserSecurityPasswordHintInfo>
  updateUserPasswordHintInfo(
    userId: number,
    params: IUserUpdateSecurityPasswordHintInfoParams
  ): Promise<IUserUpdateSecurityPasswordHintInfo>

  getAllSecurityQuestions(findParams: IFindParams): Promise<ISecurityQuestionInfo[]>
  getSecurityQuestion(questionId: number): Promise<ISecurityQuestionInfo>
  updateSecurityQuestion(
    questionId: number | null,
    params: IISecurityQuestionInfoUpdateParams
  ): Promise<IISecurityQuestionInfoUpdate>
  deleteSecurityQuestion(questionId: number): Promise<IISecurityQuestionInfoDelete>

  getUserSecurityQuestionAnswers(userId: number): Promise<IUserSecurityQuestionAnswer[]>
  updateUserSecurityQuestionAnswers(
    userId: number,
    params: IUserUpdateSecurityQuestionAnswerParams
  ): Promise<IUserUpdateSecurityQuestionAnswer>
  areSecurityAnswersValid(userId: number, answers: ISecurityAnswerInfo[]): Promise<boolean>
  verifyUserSecurityQuestionAnswers(
    params: IUserVerifySecurityQuestionAnswerParams
  ): Promise<IUserVerifySecurityQuestionAnswer>
  getUserSecurityQuestionsDetail(userId: number): Promise<IUserSecurityQuestionsDetail>
}

export interface IAddressService {
  getUserAddressInfos(userId: number, findParams: IFindParams): Promise<IUserAddressInfo[]>
  addUserAddress(userId: number, params: IUserAddressInfoUpdateParams): Promise<IUserAddressInfoUpdate>
  updateUserAddress(
    userId: number,
    addressId: number,
    params: IUserAddressInfoUpdateParams
  ): Promise<IUserAddressInfoUpdate>
}

export interface ISupportedRegionService {
  getSupportedRegionsInfo(): Promise<ISupportedRegionsInfo>
  getSupportedRegionById(id: number, type: SupportedRegionType): Promise<ISupportedRegionInfo>
  updateSupportedRegion(
    id: number | null,
    type: SupportedRegionType,
    params: ISupportedRegionInfoUpdateParams
  ): Promise<ISupportedRegionInfoUpdate>
  deleteSupportedRegion(id: number, type: SupportedRegionType): Promise<ISupportedRegionInfoDelete>
}

export interface ICurrencyService {
  getAllCurrencyInfos(findParams: IFindParams): Promise<ICurrencyInfo[]>
  getCurrencyInfo(currencyId: number): Promise<ICurrencyInfo>
  updateCurrencyInfo(currencyId: number | null, params: ICurrencyInfoUpdateParams): Promise<ICurrencyInfoUpdate>
  deleteCurrencyInfo(currencyId: number): Promise<ICurrencyInfoDelete>
}

export interface IFAQService {
  getAllFAQTopicInfos(findParams: IFindParams): Promise<IFAQTopicInfo[]>
  getFAQTopicInfo(faqTopicId: number): Promise<IFAQTopicInfo>
  updateFAQTopicInfo(faqTopicId: number | null, params: IFAQTopicInfoUpdateParams): Promise<IFAQTopicInfoUpdate>
  deleteFAQTopicInfo(faqTopicId: number): Promise<IFAQTopicInfoDelete>

  getFAQInfosByTopicId(faqTopicId: number, findParams: IFindParams): Promise<IFAQInfo[]>
  getFAQInfoById(faqId: number): Promise<IFAQInfo>
  updateFAQInfo(faqId: number | null, params: IFAQInfoUpdateParams): Promise<IFAQInfoUpdate>
  deleteFAQInfo(faqId: number): Promise<IFAQInfoUpdate>
}

export interface ISearchService {
  getSearchInfoByQuery(query: string, findParams: IFindParams): Promise<ISearchInfo>
}

export interface IStaticPageService {
  // tnc
  getTnCDetail(): Promise<IStaticPageDetail>
  updateTnCDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate>

  // privacy policy
  getPrivacyPolicyDetail(): Promise<IStaticPageDetail>
  updatePrivacyPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate>

  // refund policy
  getRefundPolicyDetail(): Promise<IStaticPageDetail>
  updateRefundPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate>

  // shipping policy
  getShippingPolicyDetail(): Promise<IStaticPageDetail>
  updateShippingPolicyDetail(params: IStaticPageUpdateParams): Promise<IStaticPageUpdate>
}

export interface ICartService {
  getUserCartDetail(userId: number): Promise<ICartDetail>
  addUserCartItem(userId: number, params: IUserCartItemAddParams): Promise<IUserCartItemAdd>
  deleteUserCartItem(userId: number, cartId?: number): Promise<IUserCartItemDelete>
}

export interface IWishlistService {
  getUserWishInfos(userId: number): Promise<IUserWishInfo[]>
  addUserWishInfo(userId: number, params: IUserWishInfoAddParams): Promise<IUserWishInfoAdd>
  deleteUserWishInfo(userId: number, userWishId: number): Promise<IUserWishInfoDelete>
}

export interface IPaymentService {
  initiatePayment(userId: number): Promise<IInitiatePayment>
  successfulPayment(userId: number, params: ISuccessfulPaymentParams): Promise<ISuccessfulPayment>
}

export interface IOrderService {
  getUserOrderInfos(userId: number, findParams: IFindParams): Promise<IOrderInfo[]>
  getOrderInfo(orderId: number): Promise<IOrderInfo>
  getUserOrderInfo(userId: number, orderId: number): Promise<IOrderInfo>
  addUserOrderInfo(userId: number, params: IOrderAddParams): Promise<number>
  updateOrderInfo(orderId: number, params: IUpdateOrderInfoParams): Promise<IUpdateOrderInfo>
  getOrderDetail(orderId: number): Promise<IOrderDetail>
  getUserOrderDetail(userId: number, orderId: number): Promise<IOrderDetail>
  getRecentOrders(findParams: IFindParams): Promise<IOrderInfo[]>
  refundUserOrderDetail(userId: number, orderId: number, params: IRefundOrderDetailParams): Promise<IRefundOrderDetail>
  addOrderStatusHistory(orderId: number, orderStatusId: number): Promise<void>

  getAllOrderStatusInfos(findParams: IFindParams): Promise<IOrderStatusInfo[]>
  getOrderStatusInfo(statusId: number): Promise<IOrderStatusInfo>
  updateOrderStatusInfo(statusId: number | null, params: IOrderStatusInfoUpdateParams): Promise<IOrderStatusInfoUpdate>
  deleteOrderStatusInfo(statusId: number): Promise<IOrderStatusInfoDelete>
}

export interface IAdminService {
  adminLogin(params: IAdminVerifyParams): Promise<IAdminVerify>
  clearCache(): Promise<void>
}

export interface IImageService {
  getAllImageInfos(findParams: IFindParams): Promise<IImageInfo[]>
  getImageInfo(imageId: number): Promise<IImageInfo>
  getImageInfoByIds(imageIds: number[]): Promise<Record<number, IImageInfo>>
  updateImageInfo(imageId: number | null, params: IImageInfoUpdateParams): Promise<IImageInfoUpdate>
  getAllImageInfosByQuery(query: string, findParams: IFindParams): Promise<IImageInfo[]>
}
