import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne } from 'typeorm'
import Order from './OrderModel'

@Entity()
export default class OrderCancellation {
  @PrimaryGeneratedColumn()
  id: number

  @OneToOne(type => Order)
  order: Order

  @Column({ type: 'varchar', name: 'reason' })
  reason: string

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
