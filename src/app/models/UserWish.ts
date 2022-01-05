import { Entity, Column, PrimaryGeneratedColumn, OneToMany, OneToOne, ManyToOne } from 'typeorm'
import ComboProduct from './ComboProductModel'
import IndividualProduct from './IndividualProductModel'
import User from './UserModel'

@Entity()
export default class UserWish {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number

  @ManyToOne(type => User)
  user: User

  @ManyToOne(type => IndividualProduct)
  individualProduct: IndividualProduct | null

  @ManyToOne(type => ComboProduct)
  comboProduct: ComboProduct | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
