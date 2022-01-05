import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany, ManyToOne } from 'typeorm'
import ComboProductItem from './ComboProductItemModel'
import ProductSKU from './ProductSKUModel'
import ProductAttribute from './ProductAttributeModel'
import ProductTag from './ProductTagModel'
import ProductFeatureSection from './ProductFeatureSectionModel'
import ProductsRelation from './ProductsRelationModel'
import Image from './ImageModel'

@Entity()
export default class ComboProduct {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ type: 'varchar', name: 'name', unique: true })
  name: string

  @Column({ type: 'varchar', name: 'shortName', nullable: true })
  shortName: string | null

  @Column({ type: 'mediumtext', name: 'description' })
  description: string

  @Column({ type: 'varchar', name: 'imageIds' })
  imageIds: string

  // Populated at repo level
  images: Image[]

  @OneToOne(
    type => ProductSKU,
    productSKU => productSKU.comboProduct
  )
  sku: ProductSKU

  @OneToMany(
    type => ComboProductItem,
    comboProductItem => comboProductItem.comboProduct
  )
  individualComboProducts: ComboProductItem[]

  @OneToMany(
    type => ProductAttribute,
    productAttribute => productAttribute.comboProduct
  )
  attributes: ProductAttribute[]

  @OneToMany(
    type => ProductTag,
    productTag => productTag.comboProduct
  )
  tags: ProductTag[]

  @OneToMany(
    type => ProductFeatureSection,
    productFeatureSection => productFeatureSection.comboProduct
  )
  featureSections: ProductFeatureSection[]

  @ManyToOne(type => ProductsRelation)
  productsRelation: ProductsRelation

  @Column({ type: 'mediumtext', name: 'seoTitle', nullable: true })
  seoTitle: string | null

  @Column({ type: 'mediumtext', name: 'seoDescription', nullable: true })
  seoDescription: string | null

  @Column({ type: 'mediumtext', name: 'seoKeywords', nullable: true })
  seoKeywords: string | null

  @Column({ type: 'int', name: 'position' })
  position: number

  @Column({ type: 'boolean', name: 'isActive' })
  isActive: boolean

  @Column({ type: 'timestamp', name: 'createdAt', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @Column({ type: 'timestamp', name: 'updatedAt', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date
}
