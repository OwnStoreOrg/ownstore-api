import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm'
import Image from './ImageModel'

@Entity()
export default class Blog {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'mediumtext', name: 'title' })
  title: string

  @Column({ type: 'mediumtext', name: 'description' })
  description: string

  @Column({ type: 'varchar', name: 'url' })
  url: string

  @ManyToOne(type => Image)
  @JoinColumn()
  image: Image | null

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
