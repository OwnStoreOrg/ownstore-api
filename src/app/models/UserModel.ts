import { Entity, Column, PrimaryGeneratedColumn, OneToOne, OneToMany, JoinColumn } from 'typeorm'
import UserAddress from './UserAddressModel'
import UserPasswordHint from './UserPasswordHintModel'

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'varchar', name: 'email', unique: true, nullable: true })
  email: string | null

  @Column({ type: 'varchar', name: 'phoneNumber', unique: true, nullable: true })
  phoneNumber: string | null

  @Column({ type: 'varchar', name: 'password' })
  password: string

  @Column({ type: 'timestamp', name: 'joinedAt', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @OneToMany(
    type => UserAddress,
    userAddress => userAddress.user
  )
  addresses: UserAddress[]

  @OneToOne(
    type => UserPasswordHint,
    userPasswordHint => userPasswordHint.user
  )
  passwordHint: UserPasswordHint
}
