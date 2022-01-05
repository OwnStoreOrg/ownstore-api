import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, Column, ManyToOne } from 'typeorm'
import Section from './SectionModel'

@Entity()
export default class SectionPageExplore {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Section)
  section: Section

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'varchar', name: 'title', nullable: true })
  title: string | null

  @Column({ type: 'varchar', name: 'subTitle', nullable: true })
  subTitle: string | null

  @Column({ type: 'varchar', name: 'showMoreUrl', nullable: true })
  showMoreUrl: string | null

  @Column({ type: 'boolean', name: 'showDivider', nullable: true })
  showDivider: boolean | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
