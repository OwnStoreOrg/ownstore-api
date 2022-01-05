import { EntityRepository, Repository, FindManyOptions, In } from 'typeorm'
import SectionSlide from '../models/SectionSlideModel'
import { IFindCommand } from './commands/common'
import { ISlideInfoUpdateCommand } from './commands/section'

@EntityRepository(SectionSlide)
export default class SectionSlideRepository extends Repository<SectionSlide> {
  public async getBulkBySectionIds(
    sectionIds: number[],
    findCommand: IFindCommand
  ): Promise<Record<number, SectionSlide[]>> {
    const result: Record<number, SectionSlide[]> = {}

    const _findOptions: FindManyOptions<SectionSlide> = {
      relations: ['section', 'image'],
      where: {
        section: {
          id: In([...sectionIds]),
        },
      },
      skip: findCommand.offset,
      take: findCommand.limit,
    }

    const slides = await this.find(_findOptions)

    slides.forEach(slide => {
      const allSlides = result[slide.section.id] || []
      allSlides.push(slide)
      result[slide.section.id] = allSlides
    })

    return result
  }

  public async addSlide(command: ISlideInfoUpdateCommand): Promise<SectionSlide> {
    const newDeal = await this.save({
      section: command.sectionId as any,
      url: command.url,
      image: command.imageId as any,
      mobileImage: command.mobileImageId as any,
      position: command.position,
      isActive: command.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    return newDeal
  }

  public async updateSlide(command: ISlideInfoUpdateCommand): Promise<void> {
    await this.update(
      {
        id: command.id as number,
      },
      {
        section: command.sectionId as any,
        url: command.url,
        image: command.imageId as any,
        mobileImage: command.mobileImageId as any,
        position: command.position,
        isActive: command.isActive,
        updatedAt: new Date(),
      }
    )
  }

  public async deleteSlide(id: number): Promise<void> {
    await this.delete({
      id: id,
    })
  }
}
