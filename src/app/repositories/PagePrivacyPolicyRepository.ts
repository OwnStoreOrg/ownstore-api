import { EntityRepository, Repository } from 'typeorm'
import PagePrivacyPolicy from '../models/PagePrivacyPolicyModel'
import { IStaticPageDetailUpdateCommand } from './commands/staticPage'

@EntityRepository(PagePrivacyPolicy)
export default class TnCRepository extends Repository<PagePrivacyPolicy> {
  public async getPrivacyPolicy(): Promise<PagePrivacyPolicy> {
    const tncDetail = await this.find()
    return tncDetail[0]
  }

  public async updatePrivacyPolicy(command: IStaticPageDetailUpdateCommand): Promise<void> {
    await this.update(
      {},
      {
        title: command.title,
        body: command.body,
        updatedAt: new Date(),
      }
    )
  }
}
