import { Entity, Column, PrimaryGeneratedColumn, OneToMany, JoinColumn } from 'typeorm'
import { IImageInfo } from '../contract/image'
import Image from './ImageModel'
import IndividualProduct from './IndividualProductModel'

@Entity()
export default class Catalogue {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number

  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string

  @OneToMany(
    type => IndividualProduct,
    individualProductModel => individualProductModel.catalogue
  )
  products: IndividualProduct[]

  @Column({ type: 'varchar', name: 'imageIds' })
  imageIds: string

  // Populated at repo level
  images: Image[]

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
