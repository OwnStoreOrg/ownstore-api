import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import Image from './ImageModel'
import Section from './SectionModel'

@Entity()
export default class SectionCustomerFeedback {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.customerFeedbacks,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @Column({ type: 'varchar', name: 'customerName' })
  customerName: string

  @Column({ type: 'varchar', name: 'customerEmail', nullable: true })
  customerEmail: string | null

  @Column({ type: 'varchar', name: 'customerDesignation', nullable: true })
  customerDesignation: string | null

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'longtext', name: 'feedback' })
  feedback: string

  @ManyToOne(type => Image)
  @JoinColumn()
  image: Image

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
