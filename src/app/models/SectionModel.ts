import { PrimaryGeneratedColumn, Entity, Column, OneToMany } from 'typeorm'
import { SectionType } from '../contract/constants'
import SectionCatalogue from './SectionCatalogueModel'
import SectionBlog from './SectionBlogModel'
import SectionSlide from './SectionSlideModel'
import SectionUSP from './SectionUSPModel'
import SectionProcedure from './SectionProcedureModel'
import SectionCustomerFeedback from './SectionCustomerFeedbackModel'
import SectionCustom from './SectionCustomModel'
import SectionProduct from './SectionProductModel'

@Entity()
export default class Section {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title: string | null

  @Column({ type: 'varchar', name: 'subTitle', nullable: true })
  subTitle: string | null

  @Column({ type: 'varchar', name: 'showMoreUrl', nullable: true })
  showMoreUrl: string | null

  @Column({ type: 'boolean', name: 'showDivider', nullable: true })
  showDivider: boolean | null

  @Column({ type: 'enum', enum: Object.values(SectionType), name: 'type' })
  type: SectionType

  @OneToMany(
    type => SectionProduct,
    sectionProduct => sectionProduct.section
  )
  products: SectionProduct[]

  @OneToMany(
    type => SectionCatalogue,
    sectionCatalogue => sectionCatalogue.section
  )
  catalogues: SectionCatalogue[]

  @OneToMany(
    type => SectionBlog,
    sectionBlog => sectionBlog.section
  )
  blogs: SectionBlog[]

  @OneToMany(
    type => SectionSlide,
    slide => slide.section
  )
  slides: SectionSlide[]

  @OneToMany(
    type => SectionUSP,
    usp => usp.section
  )
  uspList: SectionUSP[]

  @OneToMany(
    type => SectionProcedure,
    procedure => procedure.section
  )
  procedures: SectionProcedure[]

  @OneToMany(
    type => SectionCustomerFeedback,
    customerFeedback => customerFeedback.section
  )
  customerFeedbacks: SectionCustomerFeedback[]

  @OneToMany(
    type => SectionCustom,
    customerFeedback => customerFeedback.section
  )
  customSections: SectionCustom[]

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
