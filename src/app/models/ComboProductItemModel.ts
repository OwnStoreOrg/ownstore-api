import { Entity, PrimaryGeneratedColumn, JoinColumn, OneToOne, ManyToOne } from 'typeorm'
import ComboProduct from './ComboProductModel'
import IndividualProduct from './IndividualProductModel'

@Entity()
export default class ComboProductItem {
  @PrimaryGeneratedColumn()
  id: number

  @ManyToOne(
    type => ComboProduct,
    combo => combo.individualComboProducts
  )
  comboProduct: ComboProduct

  @ManyToOne(type => IndividualProduct)
  individualProduct: IndividualProduct
}
