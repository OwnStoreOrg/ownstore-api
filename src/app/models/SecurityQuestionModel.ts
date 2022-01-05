import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'

@Entity()
export default class SecurityQuestion {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'question', unique: true })
  question: string

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
