import { EntityRepository, Repository, FindManyOptions } from 'typeorm'
import SectionPageComboProduct from '../models/SectionPageComboProductModel'
import { IPageSectionInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionPageComboProduct)
export default class ProductSectionRepository extends Repository<SectionPageComboProduct> {
  public async getBulkBySectionId(ids: number[]): Promise<Record<number, SectionPageComboProduct>> {
    const result: Record<number, SectionPageComboProduct> = {}

    const findParams: FindManyOptions<SectionPageComboProduct> = {
      relations: ['section'],
    }

    const sections = await (ids.length === 0 ? this.find(findParams) : this.findByIds(ids, findParams))

    sections.forEach(section => {
      result[section.section.id] = section
    })
    return result
  }

  public async addSection(command: IPageSectionInfoUpdateCommand): Promise<SectionPageComboProduct> {
    const newSection = await this.save({
      position: command.position,
      title: command.title,
      subTitle: command.subTitle,
      showMoreUrl: command.showMoreUrl,
      showDivider: command.showDivider,
      section: command.sectionId as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newSection
  }

  public async updateSection(command: IPageSectionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        position: command.position,
        title: command.title,
        subTitle: command.subTitle,
        showMoreUrl: command.showMoreUrl,
        showDivider: command.showDivider,
        section: command.sectionId as any,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSection(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
