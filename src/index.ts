import path from 'path'
import { config } from 'dotenv'

const appEnv = process.env.STORE_API_ENV

if (!appEnv) {
  throw new Error('STORE_API_ENV env variable is not set')
}

config({
  path: path.resolve(process.cwd(), 'env', `${appEnv}.env`),
})

import { appLogger } from './logger'

process.on('uncaughtException', (error: Error): void => {
  appLogger.error(error)
  process.exit(1)
})

// Catch unhandling rejected promises
process.on('unhandledRejection', (reason: any): void => {
  appLogger.error(reason)
})

import App from './app'
import Server from './server'
import appConfig from './appConfig'

App.init()
Server.init()
