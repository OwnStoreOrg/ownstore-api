import ms from 'ms'

const appConfig = {
  isDev: process.env.STORE_API_ENV?.includes('local'),
  env: process.env.STORE_API_ENV,
  global: {
    app: {
      name: 'OwnStore',
      key: 'OWN-STORE',
      supportEmail: 'ownstoreonlinee@gmail.com',
    },
    domain: process.env.STORE_API_DOMAIN,
    baseUrl: process.env.STORE_API_BASE_URL,
    clientOrigins: [
      'http://localhost:3000', // website local
      'http://localhost:3002', // cms local
      'https://own-store-demo.vercel.app', // website prod
      'https://own-store-demo-cms.vercel.app', // cms prod
    ],
    pageSectionItemsLimit: 15,
    showDoc: process.env.STORE_API_SHOW_DOC === 'true',
  },
  admin: {
    cacheClearKey: process.env.STORE_API_ADMIN_CACHE_CLEAR_KEY,
    auth: {
      key: process.env.STORE_API_ADMIN_AUTH_KEY,
      tokenSecret: process.env.STORE_API_ADMIN_AUTH_TOKEN_SECRET,
      tokenExpiry: '30m',
    },
  },
  errors: {
    report4xxErrors: false,
  },
  userAuth: {
    tokenSecret: process.env.STORE_API_USER_AUTH_TOKEN_SECRET,
    // https://github.com/vercel/ms
    tokenExpiry: {
      default: '24h', // By default, keep user's session for 24 hours.
      extended: '7d', // Keep user's session for 7 days when 'remember me' checked is checked
    },
  },
  order: {
    status: {
      // This has dependancy in code. So map the ID of status from order_history here. Only these 2 require mapping here.
      RECEIVED: 1,
      CANCELLED: 5,
    },
    cancellationReasons: [
      'Delayed Delivery Cancellation',
      'Duplicate Order',
      'Product not required anymore',
      'Cash Issue',
      'Ordered by mistake',
    ],
  },
  payment: {
    refundAmountPercent: 98, // percent in numbers
    tax: {
      // first priority is given to 'percent'. If null, considers 'flat' key.
      percent: 2, // number | null
      flat: null, // number | null
      decimalPrecision: 2, // number | null. This controls the number of decimals after calculation of tax. For eg. 17.23491 => 17.23
    },
    extraCharges: {
      // first priority is given to 'percent'. If null, considers 'flat' key.
      percent: 0, // number | null
      flat: null, // number | null
      decimalPrecision: 2, // number | null. This controls the number of decimals after calculation of extra charges. For eg. 17.23491 => 17.23
    },
    // Smallest currency unit to form 1. For eg. 1 dollar = 100 cents, 1 rupee = 100 paisa
    smallestCurrencyUnit: 100,
    // A mapping of [whenAmountAbove]: [deliveryPrice]. Should be in ascending order of whenAmountAbove.
    deliveryPriceMapping: {
      0: 50, // when above 0, charge is 50
      200: 30, // when above 200, charge is 30
      500: 20, // when above 500, charge is 20
      1000: 0, // when above 1000, charge is 0
    },
  },
  database: {
    url: process.env.STORE_API_DB_URL as string,
    host: process.env.STORE_API_DB_HOST as string,
    port: parseInt(process.env.STORE_API_DB_PORT as string),
    name: process.env.STORE_API_DB_NAME as string,
    user: process.env.STORE_API_DB_USER as string,
    password: process.env.STORE_API_DB_PASSWORD as string,
    enableLogging: process.env.STORE_API_DB_LOGGING_ENABLED === 'true',
    enableSync: process.env.STORE_API_DB_SYNC_ENABLED === 'true',
  },
  cache: {
    redis: {
      enabled: (process.env.STORE_API_CACHING_REDIS_ENABLED as string) === 'true',
      mode: process.env.STORE_API_CACHING_REDIS_MODE as string,
      url: process.env.STORE_API_CACHING_REDIS_URL as string,
      host: process.env.STORE_API_CACHING_REDIS_HOST as string,
      port: parseInt(process.env.STORE_API_CACHING_REDIS_PORT as string),
      dbIndex: process.env.STORE_API_CACHING_REDIS_DB_INDEX as string,
      password: process.env.STORE_API_CACHING_REDIS_PASSWORD as string,
      keyPrefix: process.env.STORE_API_CACHING_REDIS_KEY_PREFIX as string,
      maxTtl: ms(process.env.STORE_API_CACHING_REDIS_MAX_TTL) / 1000, // in seconds
    },
    httpResponse: {
      enabled: (process.env.STORE_API_CACHING_HTTP_RESPONSE_ENABLED as string) === 'true',
    },
  },
  allow: {
    newRegisterations: process.env.STORE_API_ALLOW_NEW_REGISTERATIONS === 'true',
    newOrders: process.env.STORE_API_ALLOW_NEW_ORDERS === 'true',
  },
  integrations: {
    stripePayment: {
      secretKey: process.env.STORE_API_STRIPE_SECRET_KEY as string,
    },
    sentryErrorReporting: {
      enabled: process.env.STORE_API_SENTRY_ENABLED === 'true',
      dsn: process.env.STORE_API_SENTRY_DSN as string,
    },
  },
}

export default appConfig
