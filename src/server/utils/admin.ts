import Hapi from '@hapi/hapi'
import { VALID_EXTERNAL_HEADERS } from '../../app/constants'
import AppError from '../../app/errors/AppError'
import jwt from 'jsonwebtoken'
import appConfig from '../../appConfig'
import { IServerAppState } from '../interface'
import bcrypt from 'bcrypt'

export const withAdminToken: Hapi.Lifecycle.Method = (request, h) => {
  const token = request.headers[VALID_EXTERNAL_HEADERS.ADMIN_ACCESS_TOKEN]

  if (!token) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED')
  }

  try {
    const payload = jwt.verify(token, appConfig.admin.auth.tokenSecret as string) as any
    const adminKeyMatched = bcrypt.compareSync(appConfig.admin.auth.key, payload.key)

    if (!adminKeyMatched) {
      throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED')
    }
  } catch (e) {
    throw new AppError(403, 'Invalid token', 'INVALID_TOKEN')
  }

  return null
}
