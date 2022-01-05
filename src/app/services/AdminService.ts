import { IAdminService, IHealthService } from './interface'
import { injectable } from 'inversify'
import BaseService from './BaseService'
import { IAdminVerify, IAdminVerifyParams } from '../contract/admin'
import jwt from 'jsonwebtoken'
import appConfig from '../../appConfig'
import AppError from '../errors/AppError'
import bcrypt from 'bcrypt'
import { lazyInject } from '../container'
import AppTypes from '../AppTypes'
import { ICacheProvider } from '../../support/cache/interface'

@injectable()
export default class AdminService extends BaseService implements IAdminService {
  @lazyInject(AppTypes.CacheProvider)
  private cacheProvider!: ICacheProvider

  public async adminLogin(params: IAdminVerifyParams): Promise<IAdminVerify> {
    const result: IAdminVerify = {
      success: false,
      token: null,
    }

    if (params.key !== appConfig.admin.auth.key) {
      throw new AppError(403, 'Invalid admin key', 'INVALID_ADMIN_KEY')
    } else {
      const hashedKey = bcrypt.hashSync(params.key, 10)

      const signedToken = jwt.sign({ key: hashedKey }, appConfig.admin.auth.tokenSecret as string, {
        expiresIn: appConfig.admin.auth.tokenExpiry,
      })

      result.success = true
      result.token = signedToken
    }

    return result
  }

  public async clearCache(): Promise<void> {
    return this.cacheProvider.clear()
  }
}
