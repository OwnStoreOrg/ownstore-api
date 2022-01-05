import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne } from 'typeorm'
import User from './UserModel'
import { UserAddressType } from '../contract/constants'

@Entity()
export default class UserAddress {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => User,
    user => user.addresses
  )
  user: User

  @Column({ type: 'mediumtext', name: 'name' })
  name: string

  @Column({ type: 'mediumtext', name: 'phoneNumber' })
  phoneNumber: string

  @Column({ type: 'mediumtext', name: 'addressLine' })
  addressLine: string

  @Column({ type: 'varchar', name: 'area' })
  area: string

  @Column({ type: 'int', name: 'areaCode', nullable: true })
  areaCode: number | null

  @Column({ type: 'varchar', name: 'city' })
  city: string

  @Column({ type: 'varchar', name: 'country' })
  country: string

  @Column({ type: 'boolean', name: 'isPrimary' })
  isPrimary: boolean

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'enum', enum: Object.values(UserAddressType), name: 'addressType' })
  addressType: UserAddressType

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
