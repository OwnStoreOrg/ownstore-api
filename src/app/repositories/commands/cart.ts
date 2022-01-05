export interface ICartUpdateByProductCommand {
  userId: number
  individualProductId: number | null
  comboProductId: number | null
  totalQuantity: number
}

export interface ICartUpdateByIdCommand {
  userId: number
  cartId: number
  totalQuantity: number | null
}

export interface ICartAddCommand {
  userId: number
  individualProductId: number | null
  comboProductId: number | null
  totalQuantity: number
}

export interface ICartDeleteCommand {
  userId: number
  cartId?: number
}
