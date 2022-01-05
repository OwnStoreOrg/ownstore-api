import { EntityRepository, Repository } from 'typeorm'
import PageShippingPolicy from '../models/PageShippingPolicyModel'
import { IStaticPageDetailUpdateCommand } from './commands/staticPage'

@EntityRepository(PageShippingPolicy)
export default class PageShippingPolicyRepository extends Repository<PageShippingPolicy> {
  public async getShippingPolicy(): Promise<PageShippingPolicy> {
    const tncDetail = await this.find()
    return tncDetail[0]
  }

  public async updateShippingPolicy(command: IStaticPageDetailUpdateCommand): Promise<void> {
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
