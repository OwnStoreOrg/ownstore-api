import Hapi from '@hapi/hapi'
import AppError from '../../app/errors/AppError'
import jwt from 'jsonwebtoken'
import appConfig from '../../appConfig'
import { IUserInfo, IUserLoginAttributesInfoParams } from '../../app/contract/user'
import { IServerAppState } from '../interface'
import requestIp from 'request-ip'
import { VALID_EXTERNAL_HEADERS } from '../../app/constants'

export const withUserToken: Hapi.Lifecycle.Method = (request, h) => {
  const token = request.headers[VALID_EXTERNAL_HEADERS.ACCESS_TOKEN]

  if (!token) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  try {
    const userPayload = jwt.verify(token, appConfig.userAuth.tokenSecret as string) as IUserInfo
    request.app['user'] = userPayload
  } catch (e) {
    throw new AppError(403, 'Invalid token', 'INVALID_TOKEN')
  }

  return null
}

export const getUserInfoFromRequest = (request: Hapi.Request): IUserInfo => {
  return (request.app as IServerAppState).user as IUserInfo
}

export const setResponseTtl = (request: Hapi.Request, ttlInSeconds: number): void => {
  const appState = request.app as IServerAppState
  appState.responseTtl = ttlInSeconds
}

export const prepareLoginAttributeParamsFromRequest = (request: Hapi.Request): IUserLoginAttributesInfoParams => {
  const payload = request.payload as any
  const result: any = {
    userAgent: payload.loginAttributes.userAgent,
    dimension: payload.loginAttributes.dimension,
    ipAddress: requestIp.getClientIp(request),
    loginSource: payload.loginAttributes.loginSource,
    loginType: payload.loginAttributes.loginType,
    platform: payload.loginAttributes.platform,
    url: payload.loginAttributes.url,
    networkInformation: null,
  }

  if (payload.loginAttributes.networkInformation) {
    result.networkInformation = {
      type: payload.loginAttributes.networkInformation.type,
      effectiveType: payload.loginAttributes.networkInformation.effectiveType,
    }
  }

  return result
}
