import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import User from './UserModel'

@Entity()
export default class UserPasswordHint {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'hint' })
  hint: string

  @OneToOne(
    type => User,
    user => user.passwordHint
  )
  @JoinColumn()
  user: User

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
