import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne, OneToMany } from 'typeorm'
import IndividualProduct from './IndividualProductModel'
import ComboProduct from './ComboProductModel'

@Entity()
export default class ProductFeatureSection {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'title' })
  title: string

  @Column({ type: 'longtext', name: 'body' })
  body: string

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
