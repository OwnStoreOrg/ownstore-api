import pino from 'pino'
import appConfig from './appConfig'

export const hapiLogger: pino.Logger = pino({
  name: 'hapi',
  level: appConfig.isDev ? 'info' : 'error',
  timestamp: pino.stdTimeFunctions.isoTime,
  prettyPrint: appConfig.isDev,
  redact: ['req.id', 'req.headers'],
})

export const appLogger: pino.Logger = pino({
  name: 'app',
  level: appConfig.isDev ? 'debug' : 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  prettyPrint: appConfig.isDev,
})
