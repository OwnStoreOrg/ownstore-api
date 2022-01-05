import { EntityRepository, Repository } from 'typeorm'
import ComboProductItem from '../models/ComboProductItemModel'

@EntityRepository(ComboProductItem)
export default class ComboProductItemRepository extends Repository<ComboProductItem> {}
