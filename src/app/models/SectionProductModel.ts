import { PrimaryGeneratedColumn, Entity, Column, OneToMany, ManyToOne } from 'typeorm'
import { ProductType } from '../contract/constants'
import Section from './SectionModel'
import IndividualProductModel from './IndividualProductModel'
import ComboProduct from './ComboProductModel'

@Entity()
export default class SectionProduct {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => Section,
    section => section.products,
    {
      onDelete: 'CASCADE',
    }
  )
  section: Section

  @ManyToOne(type => IndividualProductModel)
  individualProduct: IndividualProductModel | null

  @ManyToOne(type => ComboProduct)
  comboProduct: ComboProduct | null

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'enum', enum: Object.values(ProductType), name: 'productType' })
  productType: ProductType

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
