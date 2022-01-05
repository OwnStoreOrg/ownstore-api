import appConfig from '../../appConfig'

export const CACHE_MULTIPLIER = 0.8

// Ideally service-level cache time should be 80% of controller's
// in seconds
export const SERVICE_CACHE_TTL = {
  LIVE: 30 * CACHE_MULTIPLIER,
  SHORT: 2 * 60 * CACHE_MULTIPLIER,
  DEFAULT: 5 * 60 * CACHE_MULTIPLIER,
  LONG: 10 * 60 * CACHE_MULTIPLIER,
}

// in seconds
export const CONTROLLER_CACHE_TTL = {
  LIVE: 30,
  SHORT: 2 * 60,
  DEFAULT: 5 * 60,
  LONG: 10 * 60,
}

export const VALID_EXTERNAL_HEADERS = {
  ACCESS_TOKEN: 'x-access-token',
  ADMIN_ACCESS_TOKEN: 'x-admin-access-token',
  SENTRY_TRACE: 'sentry-trace',
  RESPONSE_CACHE_TIME: `${appConfig.global.app.key.toLowerCase()}-cache-time`,
}
