import { Entity, PrimaryGeneratedColumn, JoinColumn, Column, ManyToOne, OneToOne } from 'typeorm'

@Entity()
export default class ProductsRelation {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name' })
  name: string

  @Column({ type: 'varchar', name: 'description', nullable: true })
  description: string | null

  @Column({ type: 'varchar', name: 'relatedProductIds' })
  relatedProductIds: string

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
