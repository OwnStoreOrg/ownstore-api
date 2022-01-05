import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

/*
  Required ids for status. Must
  1 => Received
  5 => Cancelled
*/

@Entity()
export default class OrderStatusType {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
