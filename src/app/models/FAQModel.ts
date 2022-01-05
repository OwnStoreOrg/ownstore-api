import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import FAQTopic from './FAQTopicModel'

@Entity()
export default class FAQ {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'question' })
  question: string

  @Column({ type: 'varchar', name: 'answer' })
  answer: string

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @ManyToOne(
    type => FAQTopic,
    faqTopic => faqTopic.questions
  )
  topic: FAQTopic

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
