import { PrimaryGeneratedColumn, Entity, Column, OneToMany, ManyToOne } from 'typeorm'
import Section from './SectionModel'
import Catalogue from './CatalogueModel'

@Entity()
export default class SectionCatalogue {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.catalogues,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @ManyToOne(type => Catalogue)
  catalogue: Catalogue

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
