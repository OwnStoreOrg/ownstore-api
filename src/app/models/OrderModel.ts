import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm'
import { PaymentMethodType } from '../contract/constants'
import Currency from './CurrencyModel'
import OrderCancellation from './OrderCancellationModel'
import UserAddress from './UserAddressModel'
import User from './UserModel'

@Entity()
export default class Order {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => User)
  user: User

  @ManyToOne(type => UserAddress)
  address: UserAddress

  @ManyToOne(type => Currency)
  currency: Currency

  @Column({ type: 'int', name: 'retailAmount' })
  retailAmount: number

  @Column({ type: 'int', name: 'saleAmount' })
  saleAmount: number

  @Column({ type: 'int', name: 'discountAmount' })
  discountAmount: number

  @Column({ type: 'int', name: 'deliveryAmount' })
  deliveryAmount: number

  @Column({ type: 'int', name: 'totalAmount' })
  totalAmount: number

  @Column({ type: 'int', name: 'extraChargesAmount', nullable: true })
  extraChargesAmount: number | null

  @Column({ type: 'int', name: 'taxAmount', nullable: true })
  taxAmount: number | null

  @Column({ type: 'mediumtext', name: 'cartJSON' })
  cartJSON: string

  @Column({ type: 'mediumtext', name: 'thirdPartyPaymentId' })
  thirdPartyPaymentId: string

  @Column({ type: 'varchar', name: 'statusText', nullable: true })
  statusText: string | null

  @Column({ type: 'enum', enum: Object.values(PaymentMethodType), name: 'paymentMethod' })
  paymentMethod: PaymentMethodType

  @OneToOne(type => OrderCancellation)
  @JoinColumn()
  orderCancellation: OrderCancellation

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
