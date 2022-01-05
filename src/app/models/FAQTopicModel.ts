import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm'
import FAQ from './FAQModel'

@Entity()
export default class FAQTopic {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @OneToMany(
    type => FAQ,
    faq => faq.topic
  )
  questions: FAQ[]

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
