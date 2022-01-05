import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne } from 'typeorm'
import IndividualProduct from './IndividualProductModel'
import ComboProduct from './ComboProductModel'
import { ProductTagIconType } from '../contract/constants'

@Entity()
export default class ProductTag {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'enum', enum: Object.values(ProductTagIconType), name: 'iconType' })
  iconType: ProductTagIconType

  @Column({ type: 'varchar', name: 'label' })
  label: string

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
