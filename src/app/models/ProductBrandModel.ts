import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, ManyToOne, OneToMany } from 'typeorm'
import IndividualProduct from './IndividualProductModel'

@Entity()
export default class ProductBrand {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'varchar', name: 'description', nullable: true })
  description: string | null

  @OneToMany(
    type => IndividualProduct,
    individualProduct => individualProduct.brand
  )
  individualProduct: IndividualProduct

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
