import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne, OneToMany } from 'typeorm'
import IndividualProduct from './IndividualProductModel'
import Currency from './CurrencyModel'
import ComboProduct from './ComboProductModel'

@Entity()
export default class ProductSKU {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'double', name: 'retailPrice' })
  retailPrice: number

  @Column({ type: 'double', name: 'salePrice' })
  salePrice: number

  @Column({ type: 'boolean', name: 'onSale' })
  onSale: boolean

  @Column({ type: 'double', name: 'saleDiscountPercentage', nullable: true })
  saleDiscountPercentage: number | null

  @Column({ type: 'double', name: 'saleDiscountFlat', nullable: true })
  saleDiscountFlat: number | null

  @Column({ type: 'int', name: 'availableQuantity' })
  availableQuantity: number

  @ManyToOne(type => Currency)
  @JoinColumn()
  currency: Currency

  @Column({ type: 'boolean', name: 'comingSoon' })
  comingSoon: boolean

  @ManyToOne(
    type => IndividualProduct,
    individualProductModel => individualProductModel.sku
  )
  individualProduct: IndividualProduct | null

  @ManyToOne(
    type => ComboProduct,
    combo => combo.sku
  )
  comboProduct: ComboProduct | null

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
