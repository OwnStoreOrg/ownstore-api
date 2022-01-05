import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import Order from './OrderModel'
import OrderStatusType from './OrderStatusTypeModel'

@Entity()
export default class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => Order)
  order: Order

  @ManyToOne(type => OrderStatusType)
  orderStatus: OrderStatusType

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date
}
