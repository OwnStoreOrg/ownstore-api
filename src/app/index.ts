import 'reflect-metadata'
import appContainer from './container'
import {
  IHealthService,
  ICatalogueService,
  IProductService,
  IBlogService,
  ISectionService,
  IUserService,
  ISupportedRegionService,
  IFAQService,
  ISearchService,
  ICartService,
  IWishlistService,
  IPaymentService,
  IOrderService,
  IAddressService,
  ISecurityService,
  IAdminService,
  ICurrencyService,
  ISectionItemService,
  IProductElementService,
  IImageService,
  IStaticPageService,
  ISettingService,
} from './services/interface'
import HealthService from './services/HealthService'
import AppTypes from './AppTypes'
import { createConnection, Connection, ConnectionOptions } from 'typeorm'
import appConfig from '../appConfig'
import { join } from 'path'
const stripe = require('stripe')
import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import CatalogueService from './services/CatalogueService'
import ProductService from './services/ProductService'
import ProductElementService from './services/ProductElementService'
import BlogService from './services/BlogService'
import SectionElementsService from './services/SectionItemService'
import SectionService from './services/SectionService'
import UserService from './services/UserService'
import AddressService from './services/AddressService'
import SupportedRegionsService from './services/SupportedRegionsService'
import CurrencyService from './services/CurrencyService'
import FAQService from './services/FAQService'
import SearchService from './services/SearchService'
import StaticPageService from './services/StaticPageService'
import CartService from './services/CartService'
import WishlistService from './services/WishlistService'
import PaymentService from './services/PaymentService'
import OrderService from './services/OrderService'
import SecurityService from './services/SecurityService'
import SettingService from './services/SettingService'
import AdminService from './services/AdminService'
import ImageService from './services/ImageService'
import PaymentProvider from '../support/payment/PaymentProvider'
import { IPaymentProvider } from '../support/payment/interface'
import RedisCacheProvider from '../support/cache/RedisCacheProvider'
import { ICacheProvider } from '../support/cache/interface'

export default class App {
  public static init() {
    if (appConfig.integrations.sentryErrorReporting.enabled) {
      Sentry.init({
        dsn: appConfig.integrations.sentryErrorReporting.dsn,

        integrations: [
          // enable HTTP calls tracing
          new Sentry.Integrations.Http({ tracing: true }),
        ],

        tracesSampleRate: 1.0,
        environment: appConfig.env,
      })
    }

    const modelsDirectory = join(__dirname, 'models')
    const modelFiles = join(modelsDirectory, `*.{js,ts}`)

    let connectionOptions = {}

    if (appConfig.database.url) {
      connectionOptions = {
        url: appConfig.database.url,
      }
    } else {
      connectionOptions = {
        host: appConfig.database.host,
        port: appConfig.database.port,
        database: appConfig.database.name,
        username: appConfig.database.user,
        password: appConfig.database.password,
      }
    }

    createConnection({
      type: 'mysql',
      ...connectionOptions,
      synchronize: appConfig.database.enableSync,
      logging: appConfig.database.enableLogging,
      entities: [modelFiles],
    }).then(connection => {
      appContainer.bind<Connection>(AppTypes.DBProvider).toConstantValue(connection)
    })

    const maxTtl = appConfig.cache.redis.maxTtl
    const cacheProvider = new RedisCacheProvider(
      {
        enabled: appConfig.cache.redis.enabled,
        url: appConfig.cache.redis.url,
        host: appConfig.cache.redis.host,
        port: appConfig.cache.redis.port,
        password: appConfig.cache.redis.password,
        mode: appConfig.cache.redis.mode,
        dbIndex: appConfig.cache.redis.dbIndex,
        keyPrefix: appConfig.cache.redis.keyPrefix,
      },
      maxTtl,
      maxTtl
    )
    // clear cache in Dev mode
    if (!appConfig.cache.redis.enabled) {
      cacheProvider.clear()
    }
    appContainer.bind<ICacheProvider>(AppTypes.CacheProvider).toConstantValue(cacheProvider)

    const paymentProvider = new PaymentProvider()
    appContainer.bind<IPaymentProvider>(AppTypes.PaymentProvider).toConstantValue(paymentProvider)

    appContainer
      .bind<IHealthService>(AppTypes.HealthService)
      .to(HealthService)
      .inSingletonScope()

    appContainer
      .bind<ICatalogueService>(AppTypes.CatalogueService)
      .to(CatalogueService)
      .inSingletonScope()

    appContainer
      .bind<IProductService>(AppTypes.ProductService)
      .to(ProductService)
      .inSingletonScope()

    appContainer
      .bind<IProductElementService>(AppTypes.ProductElementService)
      .to(ProductElementService)
      .inSingletonScope()

    appContainer
      .bind<IBlogService>(AppTypes.BlogService)
      .to(BlogService)
      .inSingletonScope()

    appContainer
      .bind<ISectionService>(AppTypes.SectionService)
      .to(SectionService)
      .inSingletonScope()

    appContainer
      .bind<ISectionItemService>(AppTypes.SectionElementsService)
      .to(SectionElementsService)
      .inSingletonScope()

    appContainer
      .bind<IUserService>(AppTypes.UserService)
      .to(UserService)
      .inSingletonScope()

    appContainer
      .bind<IAddressService>(AppTypes.AddressService)
      .to(AddressService)
      .inSingletonScope()

    appContainer
      .bind<ISupportedRegionService>(AppTypes.SupportedRegionsService)
      .to(SupportedRegionsService)
      .inSingletonScope()

    appContainer
      .bind<ICurrencyService>(AppTypes.CurrencyService)
      .to(CurrencyService)
      .inSingletonScope()

    appContainer
      .bind<IFAQService>(AppTypes.FAQService)
      .to(FAQService)
      .inSingletonScope()

    appContainer
      .bind<ISearchService>(AppTypes.SearchService)
      .to(SearchService)
      .inSingletonScope()

    appContainer
      .bind<IStaticPageService>(AppTypes.StaticPageService)
      .to(StaticPageService)
      .inSingletonScope()

    appContainer
      .bind<ICartService>(AppTypes.CartService)
      .to(CartService)
      .inSingletonScope()

    appContainer
      .bind<IWishlistService>(AppTypes.WishlistService)
      .to(WishlistService)
      .inSingletonScope()

    appContainer
      .bind<IPaymentService>(AppTypes.PaymentService)
      .to(PaymentService)
      .inSingletonScope()

    appContainer
      .bind<IOrderService>(AppTypes.OrderService)
      .to(OrderService)
      .inSingletonScope()

    appContainer
      .bind<ISecurityService>(AppTypes.SecurityService)
      .to(SecurityService)
      .inSingletonScope()

    appContainer
      .bind<ISettingService>(AppTypes.SettingService)
      .to(SettingService)
      .inSingletonScope()

    appContainer
      .bind<IAdminService>(AppTypes.AdminService)
      .to(AdminService)
      .inSingletonScope()

    appContainer
      .bind<IImageService>(AppTypes.ImageService)
      .to(ImageService)
      .inSingletonScope()
  }
}
