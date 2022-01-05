import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import SecurityQuestion from './SecurityQuestionModel'
import User from './UserModel'

@Entity()
export default class UserSecurityQuestionAnswer {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => User)
  user: User

  @ManyToOne(type => SecurityQuestion)
  securityQuestion: SecurityQuestion

  @Column({ type: 'varchar', name: 'answer' })
  answer: string

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
