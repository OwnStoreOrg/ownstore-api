import { EntityRepository, Repository } from 'typeorm'
import PageTnC from '../models/PageTnCModel'
import { IStaticPageDetailUpdateCommand } from './commands/staticPage'

@EntityRepository(PageTnC)
export default class PageTnCRepository extends Repository<PageTnC> {
  public async getTnC(): Promise<PageTnC> {
    const tncDetail = await this.find()
    return tncDetail[0]
  }

  public async updateTnC(command: IStaticPageDetailUpdateCommand): Promise<void> {
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
