import { EntityRepository, Repository } from 'typeorm'
import PageRefundPolicy from '../models/PageRefundPolicyModel'
import { IStaticPageDetailUpdateCommand } from './commands/staticPage'

@EntityRepository(PageRefundPolicy)
export default class PageRefundPolicyRepository extends Repository<PageRefundPolicy> {
  public async getRefundPolicy(): Promise<PageRefundPolicy> {
    const tncDetail = await this.find()
    return tncDetail[0]
  }

  public async updateRefundPolicy(command: IStaticPageDetailUpdateCommand): Promise<void> {
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
