import { injectable } from 'inversify'
import appConfig from '../../appConfig'
import AppTypes from '../AppTypes'
import { lazyInject } from '../container'
import { ISettingInfo } from '../contract/setting'
import BaseService from './BaseService'
import { ISecurityService, ISettingService } from './interface'

@injectable()
export default class SecurityService extends BaseService implements ISettingService {
  @lazyInject(AppTypes.SecurityService)
  private securityService!: ISecurityService

  public async getSettingInfo(userId: number): Promise<ISettingInfo> {
    const result: ISettingInfo = {
      securityQuestionsSet: false,
      allow: {
        newRegisterations: appConfig.allow.newRegisterations,
        newOrders: appConfig.allow.newOrders,
      },
    }

    const [securityAnswers] = await Promise.all([
      // this.securityService.getUserPasswordHintInfo(userId),
      this.securityService.getUserSecurityQuestionAnswers(userId),
    ])

    // Faiyaz - Password hint is disabled due to security reasons. https://www.troyhunt.com/adobe-credentials-and-serious/
    // if (passwordHint.hint) {
    //   userDetail.security.passwordHintSet = true
    // }

    if (securityAnswers.length) {
      result.securityQuestionsSet = true
    }

    return result
  }
}
