import { PrimaryGeneratedColumn, Entity, Column, OneToMany, ManyToOne } from 'typeorm'
import Section from './SectionModel'
import Blog from './BlogModel'

@Entity()
export default class SectionBlog {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.blogs,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @ManyToOne(type => Blog)
  blog: Blog

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
