import { PrimaryGeneratedColumn, Entity, Column, OneToMany, ManyToOne } from 'typeorm'
import Section from './SectionModel'

@Entity()
export default class SectionCustom {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.customSections,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @Column({ type: 'longtext', name: 'customHTML' })
  customHTML: string

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
