import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import ComboProduct from './ComboProductModel'
import IndividualProduct from './IndividualProductModel'
import User from './UserModel'

@Entity()
export default class UserCartItem {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => User)
  user: User

  @ManyToOne(type => IndividualProduct)
  individualProduct: IndividualProduct | null

  @ManyToOne(type => ComboProduct)
  comboProduct: ComboProduct | null

  @Column({ type: 'int', name: 'quantity' })
  quantity: number

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
