import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import Image from './ImageModel'
import Section from './SectionModel'

@Entity()
export default class SectionProcedure {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.procedures,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @ManyToOne(type => Image)
  @JoinColumn()
  image: Image | null

  @Column({ type: 'varchar', name: 'title' })
  title: string

  @Column({ type: 'varchar', name: 'subTitle' })
  subTitle: string

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
