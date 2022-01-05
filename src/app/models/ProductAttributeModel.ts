import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from 'typeorm'
import IndividualProduct from './IndividualProductModel'
import ProductAttributeKey from './ProductAttributeKeyModel'
import ComboProduct from './ComboProductModel'

@Entity()
export default class ProductAttribute {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(type => ProductAttributeKey)
  @JoinColumn()
  attributeKey: ProductAttributeKey

  @Column({ type: 'varchar', name: 'attributeValue' })
  attributeValue: string

  @ManyToOne(
    type => IndividualProduct,
    individualProductModel => individualProductModel.attributes
  )
  individualProduct: IndividualProduct | null

  @ManyToOne(
    type => ComboProduct,
    combo => combo.attributes
  )
  comboProduct: ComboProduct | null

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
