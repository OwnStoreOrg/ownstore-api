import { EntityRepository, Repository, FindManyOptions, In, getCustomRepository } from 'typeorm'
import { IFindCommand } from './commands/common'
import SectionCatalogue from '../models/SectionCatalogueModel'
import { ICatalogueSectionInfoUpdateCommand } from './commands/section'
import CatalogueRepository from './CatalogueRepository'
import { uniqueList } from '../utils/common'

@EntityRepository(SectionCatalogue)
export default class SectionCatalogueRepositorySectionCatalogue extends Repository<SectionCatalogue> {
  private catalogueRepository = getCustomRepository(CatalogueRepository)

  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionCatalogue[]>> {
    const result: Record<number, SectionCatalogue[]> = {}

    const _findOptions: FindManyOptions<SectionCatalogue> = {
      relations: ['catalogue', 'section'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const sectionCatalogues = await this.find(_findOptions)

    const catalogueIds: number[] = []

    sectionCatalogues.forEach(section => {
      catalogueIds.push(section.catalogue.id)
    })

    const catalogues = await this.catalogueRepository.getBulk(uniqueList(catalogueIds), {})

    sectionCatalogues.forEach(sectionCatalogue => {
      const sectionCatalogues = result[sectionCatalogue.section.id] || []
      sectionCatalogues.push({
        ...sectionCatalogue,
        catalogue: catalogues[sectionCatalogue.catalogue.id],
      })
      result[sectionCatalogue.section.id] = sectionCatalogues
    })

    return result
  }

  public async addCatalogueSection(command: ICatalogueSectionInfoUpdateCommand): Promise<SectionCatalogue> {
    const newDeal = await this.save({
      position: command.position,
      isActive: command.isActive,
      catalogue: command.catalogueId as any,
      section: command.sectionId as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateCatalogueSection(command: ICatalogueSectionInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        position: command.position,
        isActive: command.isActive,
        catalogue: command.catalogueId as any,
        section: command.sectionId as any,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteCatalogueSection(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
